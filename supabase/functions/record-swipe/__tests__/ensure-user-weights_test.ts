import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.203.0/assert/mod.ts";
import { ensureUserWeights } from "../ensure-user-weights.ts";

Deno.test("ensureUserWeights returns early when there are no parameter ids", async () => {
  let fromCalls = 0;
  const supabase = {
    from() {
      fromCalls += 1;
      return {};
    },
  };

  await ensureUserWeights({
    supabase: supabase as never,
    userId: "user-1",
    parameterIds: [],
  });

  assertEquals(fromCalls, 0);
});

Deno.test("ensureUserWeights inserts neutral weight rows for requested parameters", async () => {
  let tableName = "";
  let upsertRows: Record<string, unknown>[] = [];
  let upsertOptions: Record<string, unknown> | undefined;

  const supabase = {
    from(table: string) {
      tableName = table;

      return {
        upsert(rows: Record<string, unknown>[], options: Record<string, unknown>) {
          upsertRows = rows;
          upsertOptions = options;
          return Promise.resolve({ error: null });
        },
      };
    },
  };

  await ensureUserWeights({
    supabase: supabase as never,
    userId: "user-1",
    parameterIds: ["parameter-1", "parameter-2"],
  });

  assertEquals(tableName, "user_parameter_weights");
  assertEquals(upsertRows.length, 2);
  assertEquals(upsertRows[0].user_id, "user-1");
  assertEquals(upsertRows[0].parameter_id, "parameter-1");
  assertEquals(upsertRows[0].weight, 0);
  assertEquals(upsertRows[0].interaction_count, 0);
  assertEquals(typeof upsertRows[0].updated_at, "string");
  assertEquals(upsertOptions, {
    onConflict: "user_id,parameter_id",
    ignoreDuplicates: true,
  });
});

Deno.test("ensureUserWeights throws when the upsert fails", async () => {
  const supabase = {
    from() {
      return {
        upsert() {
          return Promise.resolve({ error: { message: "upsert failed" } });
        },
      };
    },
  };

  await assertRejects(
    () =>
      ensureUserWeights({
        supabase: supabase as never,
        userId: "user-1",
        parameterIds: ["parameter-1"],
      }),
    Error,
    "Failed to ensure user weights: upsert failed",
  );
});
