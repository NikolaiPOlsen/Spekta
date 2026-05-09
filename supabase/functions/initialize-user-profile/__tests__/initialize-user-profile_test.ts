import {
  assertAlmostEquals,
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.203.0/assert/mod.ts";
import { handleInitializeUserProfile } from "../handler.ts";

type MockOptions = {
  user?: { id: string } | null;
  userError?: { message: string } | null;
  existingWeights?: unknown[] | null;
  existingWeightsError?: { message: string } | null;
  genreParameters?: { id: string }[] | null;
  genreParametersError?: { message: string } | null;
  upsertError?: { message: string } | null;
};

function createMockSupabase(options: MockOptions) {
  const calls = {
    checkedExistingWeights: false,
    fetchedGenreParameters: false,
    upsertRows: [] as Record<string, unknown>[],
    upsertOptions: undefined as Record<string, unknown> | undefined,
  };

  const supabase = {
    auth: {
      getUser() {
        return Promise.resolve({
          data: { user: options.user === undefined ? { id: "user-1" } : options.user },
          error: options.userError ?? null,
        });
      },
    },
    from(table: string) {
      if (table === "user_parameter_weights") {
        return {
          select(columns: string) {
            assertEquals(columns, "parameter_id");

            return {
              eq(column: string, value: string) {
                assertEquals(column, "user_id");
                assertEquals(value, "user-1");

                return {
                  limit(count: number) {
                    calls.checkedExistingWeights = true;
                    assertEquals(count, 1);

                    return Promise.resolve({
                      data: options.existingWeights ?? [],
                      error: options.existingWeightsError ?? null,
                    });
                  },
                };
              },
            };
          },
          upsert(rows: Record<string, unknown>[], upsertOptions: Record<string, unknown>) {
            calls.upsertRows = rows;
            calls.upsertOptions = upsertOptions;

            return Promise.resolve({ error: options.upsertError ?? null });
          },
        };
      }

      if (table === "parameters") {
        return {
          select(columns: string) {
            assertEquals(columns, "id");

            return {
              eq(column: string, value: string) {
                calls.fetchedGenreParameters = true;
                assertEquals(column, "parameter_type");
                assertEquals(value, "genre");

                return Promise.resolve({
                  data: options.genreParameters ?? [],
                  error: options.genreParametersError ?? null,
                });
              },
            };
          },
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  };

  return { calls, supabase };
}

function createRequest() {
  return new Request("https://example.test/initialize-user-profile", {
    headers: { Authorization: "Bearer token" },
  });
}

Deno.test("handleInitializeUserProfile returns unauthorized when there is no user", async () => {
  const { supabase } = createMockSupabase({ user: null });

  const response = await handleInitializeUserProfile(
    createRequest(),
    () => supabase as never,
  );
  const body = await response.json();

  assertEquals(response.status, 401);
  assertEquals(body, { error: "Unauthorized" });
});

Deno.test("handleInitializeUserProfile does not insert weights when they already exist", async () => {
  const { calls, supabase } = createMockSupabase({
    existingWeights: [{ parameter_id: "parameter-1" }],
  });

  const response = await handleInitializeUserProfile(
    createRequest(),
    () => supabase as never,
  );
  const body = await response.json();

  assertEquals(response.status, 200);
  assertEquals(body, {
    message: "User weights already initialized",
    user_id: "user-1",
    initialized_weights: 0,
  });
  assertEquals(calls.checkedExistingWeights, true);
  assertEquals(calls.fetchedGenreParameters, false);
  assertEquals(calls.upsertRows, []);
});

Deno.test("handleInitializeUserProfile initializes one weight row per genre parameter", async () => {
  const originalRandom = Math.random;
  Math.random = () => 0.5;
  const { calls, supabase } = createMockSupabase({
    genreParameters: [{ id: "genre-1" }, { id: "genre-2" }],
  });

  try {
    const response = await handleInitializeUserProfile(
      createRequest(),
      () => supabase as never,
    );
    const body = await response.json();

    assertEquals(response.status, 200);
    assertEquals(body, {
      message: "User weights initialized",
      user_id: "user-1",
      initialized_weights: 2,
    });
    assertEquals(calls.upsertRows.length, 2);
    assertEquals(calls.upsertRows[0].user_id, "user-1");
    assertEquals(calls.upsertRows[0].parameter_id, "genre-1");
    assertEquals(calls.upsertRows[0].weight, 0);
    assertEquals(calls.upsertRows[0].interaction_count, 0);
    assertEquals(typeof calls.upsertRows[0].updated_at, "string");
    assertEquals(calls.upsertOptions, {
      onConflict: "user_id,parameter_id",
      ignoreDuplicates: true,
    });
  } finally {
    Math.random = originalRandom;
  }
});

Deno.test("handleInitializeUserProfile creates starting weights inside the expected range", async () => {
  const originalRandom = Math.random;
  Math.random = () => 0.75;
  const { calls, supabase } = createMockSupabase({
    genreParameters: [{ id: "genre-1" }],
  });

  try {
    await handleInitializeUserProfile(createRequest(), () => supabase as never);

    assertAlmostEquals(calls.upsertRows[0].weight as number, 0.05);
    assertEquals((calls.upsertRows[0].weight as number) >= -0.1, true);
    assertEquals((calls.upsertRows[0].weight as number) <= 0.1, true);
  } finally {
    Math.random = originalRandom;
  }
});

Deno.test("handleInitializeUserProfile returns a server error when checking existing weights fails", async () => {
  const { supabase } = createMockSupabase({
    existingWeightsError: { message: "select failed" },
  });

  const response = await handleInitializeUserProfile(
    createRequest(),
    () => supabase as never,
  );
  const body = await response.json();

  assertEquals(response.status, 500);
  assertStringIncludes(body.error, "Failed to check existing user weights: select failed");
});

Deno.test("handleInitializeUserProfile returns a server error when genre parameters cannot be fetched", async () => {
  const { supabase } = createMockSupabase({
    genreParametersError: { message: "parameters failed" },
  });

  const response = await handleInitializeUserProfile(
    createRequest(),
    () => supabase as never,
  );
  const body = await response.json();

  assertEquals(response.status, 500);
  assertStringIncludes(body.error, "Failed to fetch genre parameters: parameters failed");
});

Deno.test("handleInitializeUserProfile returns a server error when weight upsert fails", async () => {
  const { supabase } = createMockSupabase({
    genreParameters: [{ id: "genre-1" }],
    upsertError: { message: "upsert failed" },
  });

  const response = await handleInitializeUserProfile(
    createRequest(),
    () => supabase as never,
  );
  const body = await response.json();

  assertEquals(response.status, 500);
  assertStringIncludes(body.error, "Failed to initialize user weights: upsert failed");
});
