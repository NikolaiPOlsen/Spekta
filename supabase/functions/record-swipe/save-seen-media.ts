import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

type SaveSeenMediaInput = {
  supabase: SupabaseClient;
  userId: string;
  tmdbId: number;
};

export async function saveSeenMedia({
  supabase,
  userId,
  tmdbId,
}: SaveSeenMediaInput) {
  const { error } = await supabase
    .from("user_seen_media")
    .upsert(
      {
        user_id: userId,
        tmdb_id: tmdbId,
        seen_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,tmdb_id",
      },
    );

  if (error) {
    throw new Error(`Failed to save seen media: ${error.message}`);
  }
}