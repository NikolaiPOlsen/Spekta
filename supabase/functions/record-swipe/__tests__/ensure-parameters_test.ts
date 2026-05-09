import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.203.0/assert/mod.ts";
import { ensureParameters } from "../ensure-parameters.ts";

Deno.test("ensureParameters returns early when there are no parameters", async () => {
  let fromCalls = 0;
  const supabase = {
    from() {
      fromCalls += 1;
      return {};
    },
  };

  const result = await ensureParameters({
    supabase: supabase as never,
    requestedParameters: [],
  });

  assertEquals(result, []);
  assertEquals(fromCalls, 0);
});

Deno.test("ensureParameters upserts unique parameters and returns matching rows", async () => {
  let upsertRows: unknown[] = [];
  let upsertOptions: Record<string, unknown> | undefined;
  let inValues: string[] = [];

  const supabase = {
    from(table: string) {
      assertEquals(table, "parameters");

      return {
        upsert(rows: unknown[], options: Record<string, unknown>) {
          upsertRows = rows;
          upsertOptions = options;
          return Promise.resolve({ error: null });
        },
        select(columns: string) {
          assertEquals(columns, "id, parameter_type, parameter_value");

          return {
            in(column: string, values: string[]) {
              assertEquals(column, "parameter_value");
              inValues = values;

              return Promise.resolve({
                data: [
                  { id: "genre-28", parameter_type: "genre", parameter_value: "28" },
                  { id: "keyword-28", parameter_type: "keyword", parameter_value: "28" },
                  { id: "runtime-90", parameter_type: "runtime", parameter_value: "90-119" },
                ],
                error: null,
              });
            },
          };
        },
      };
    },
  };

  const result = await ensureParameters({
    supabase: supabase as never,
    requestedParameters: [
      { parameter_type: "genre", parameter_value: "28" },
      { parameter_type: "genre", parameter_value: "28" },
      { parameter_type: "runtime", parameter_value: "90-119" },
    ],
  });

  assertEquals(upsertRows, [
    { parameter_type: "genre", parameter_value: "28" },
    { parameter_type: "runtime", parameter_value: "90-119" },
  ]);
  assertEquals(upsertOptions, {
    onConflict: "parameter_type,parameter_value",
    ignoreDuplicates: true,
  });
  assertEquals(inValues, ["28", "90-119"]);
  assertEquals(result, [
    { id: "genre-28", parameter_type: "genre", parameter_value: "28" },
    { id: "runtime-90", parameter_type: "runtime", parameter_value: "90-119" },
  ]);
});

Deno.test("ensureParameters throws when upsert fails", async () => {
  const supabase = {
    from() {
      return {
        upsert() {
          return Promise.resolve({ error: { message: "insert failed" } });
        },
      };
    },
  };

  await assertRejects(
    () =>
      ensureParameters({
        supabase: supabase as never,
        requestedParameters: [{ parameter_type: "genre", parameter_value: "28" }],
      }),
    Error,
    "Failed to ensure parameters: insert failed",
  );
});

Deno.test("ensureParameters throws when fetching matching rows fails", async () => {
  const supabase = {
    from() {
      return {
        upsert() {
          return Promise.resolve({ error: null });
        },
        select() {
          return {
            in() {
              return Promise.resolve({ data: null, error: { message: "fetch failed" } });
            },
          };
        },
      };
    },
  };

  await assertRejects(
    () =>
      ensureParameters({
        supabase: supabase as never,
        requestedParameters: [{ parameter_type: "genre", parameter_value: "28" }],
      }),
    Error,
    "Failed to fetch ensured parameters: fetch failed",
  );
});
