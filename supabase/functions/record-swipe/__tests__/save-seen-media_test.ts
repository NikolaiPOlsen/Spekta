import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.203.0/assert/mod.ts";
import { saveSeenMedia } from "../save-seen-media.ts";

Deno.test("saveSeenMedia upserts the seen movie for the current user", async () => {
  let tableName = "";
  let upsertRow: Record<string, unknown> | undefined;
  let upsertOptions: Record<string, unknown> | undefined;

  const supabase = {
    from(table: string) {
      tableName = table;

      return {
        upsert(row: Record<string, unknown>, options: Record<string, unknown>) {
          upsertRow = row;
          upsertOptions = options;
          return Promise.resolve({ error: null });
        },
      };
    },
  };

  await saveSeenMedia({
    supabase: supabase as never,
    userId: "user-1",
    tmdbId: 550,
  });

  assertEquals(tableName, "user_seen_media");
  assertEquals(upsertRow?.user_id, "user-1");
  assertEquals(upsertRow?.tmdb_id, 550);
  assertEquals(typeof upsertRow?.seen_at, "string");
  assertEquals(upsertOptions, { onConflict: "user_id,tmdb_id" });
});

Deno.test("saveSeenMedia throws when the database upsert fails", async () => {
  const supabase = {
    from() {
      return {
        upsert() {
          return Promise.resolve({ error: { message: "database unavailable" } });
        },
      };
    },
  };

  await assertRejects(
    () =>
      saveSeenMedia({
        supabase: supabase as never,
        userId: "user-1",
        tmdbId: 550,
      }),
    Error,
    "Failed to save seen media: database unavailable",
  );
});
