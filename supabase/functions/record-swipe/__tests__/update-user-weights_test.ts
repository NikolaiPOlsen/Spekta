import {
  assertAlmostEquals,
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.203.0/assert/mod.ts";
import { updateUserWeights } from "../update-user-weights.ts";

Deno.test("updateUserWeights returns early when there are no parameter ids", async () => {
  let fromCalls = 0;
  const supabase = {
    from() {
      fromCalls += 1;
      return {};
    },
  };

  const result = await updateUserWeights({
    supabase: supabase as never,
    userId: "user-1",
    parameterIds: [],
    liked: true,
  });

  assertEquals(result, []);
  assertEquals(fromCalls, 0);
});

Deno.test("updateUserWeights increases weights and interaction counts after a liked swipe", async () => {
  const originalRandom = Math.random;
  Math.random = () => 0.5;
  let upsertRows: Record<string, unknown>[] = [];

  const supabase = {
    from(table: string) {
      assertEquals(table, "user_parameter_weights");

      return {
        select(columns: string) {
          assertEquals(columns, "parameter_id, weight, interaction_count");

          return {
            eq(column: string, value: string) {
              assertEquals(column, "user_id");
              assertEquals(value, "user-1");

              return {
                in(inColumn: string, values: string[]) {
                  assertEquals(inColumn, "parameter_id");
                  assertEquals(values, ["parameter-1", "parameter-2"]);

                  return Promise.resolve({
                    data: [
                      { parameter_id: "parameter-1", weight: 0, interaction_count: 1 },
                      { parameter_id: "parameter-2", weight: "0.5", interaction_count: null },
                    ],
                    error: null,
                  });
                },
              };
            },
          };
        },
        upsert(rows: Record<string, unknown>[], options: Record<string, unknown>) {
          upsertRows = rows;
          assertEquals(options, { onConflict: "user_id,parameter_id" });
          return Promise.resolve({ error: null });
        },
      };
    },
  };

  try {
    const result = await updateUserWeights({
      supabase: supabase as never,
      userId: "user-1",
      parameterIds: ["parameter-1", "parameter-2"],
      liked: true,
    });

    assertEquals(result, upsertRows);
    assertEquals(upsertRows[0].user_id, "user-1");
    assertEquals(upsertRows[0].parameter_id, "parameter-1");
    assertAlmostEquals(upsertRows[0].weight as number, 0.25);
    assertEquals(upsertRows[0].interaction_count, 2);
    assertAlmostEquals(upsertRows[1].weight as number, 0.625);
    assertEquals(upsertRows[1].interaction_count, 1);
    assertEquals(typeof upsertRows[0].updated_at, "string");
  } finally {
    Math.random = originalRandom;
  }
});

Deno.test("updateUserWeights decreases weights after a disliked swipe", async () => {
  const originalRandom = Math.random;
  Math.random = () => 0.5;
  let upsertRows: Record<string, unknown>[] = [];

  const supabase = {
    from() {
      return {
        select() {
          return {
            eq() {
              return {
                in() {
                  return Promise.resolve({
                    data: [{ parameter_id: "parameter-1", weight: 0, interaction_count: 0 }],
                    error: null,
                  });
                },
              };
            },
          };
        },
        upsert(rows: Record<string, unknown>[]) {
          upsertRows = rows;
          return Promise.resolve({ error: null });
        },
      };
    },
  };

  try {
    await updateUserWeights({
      supabase: supabase as never,
      userId: "user-1",
      parameterIds: ["parameter-1"],
      liked: false,
    });

    assertAlmostEquals(upsertRows[0].weight as number, -0.04);
    assertEquals(upsertRows[0].interaction_count, 1);
  } finally {
    Math.random = originalRandom;
  }
});

Deno.test("updateUserWeights throws when fetching current weights fails", async () => {
  const supabase = {
    from() {
      return {
        select() {
          return {
            eq() {
              return {
                in() {
                  return Promise.resolve({ data: null, error: { message: "fetch failed" } });
                },
              };
            },
          };
        },
      };
    },
  };

  await assertRejects(
    () =>
      updateUserWeights({
        supabase: supabase as never,
        userId: "user-1",
        parameterIds: ["parameter-1"],
        liked: true,
      }),
    Error,
    "Failed to fetch current weights: fetch failed",
  );
});

Deno.test("updateUserWeights throws when upserting updated weights fails", async () => {
  const supabase = {
    from() {
      return {
        select() {
          return {
            eq() {
              return {
                in() {
                  return Promise.resolve({
                    data: [{ parameter_id: "parameter-1", weight: 0, interaction_count: 0 }],
                    error: null,
                  });
                },
              };
            },
          };
        },
        upsert() {
          return Promise.resolve({ error: { message: "upsert failed" } });
        },
      };
    },
  };

  await assertRejects(
    () =>
      updateUserWeights({
        supabase: supabase as never,
        userId: "user-1",
        parameterIds: ["parameter-1"],
        liked: true,
      }),
    Error,
    "Failed to update weights: upsert failed",
  );
});
