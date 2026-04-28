import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

type SaveSeenMediaInput = {
  supabase: SupabaseClient;
  userId: string;
  tmdbId: number;
};

/**
 * Saves or refreshes that a user has seen a TMDb movie.
 *
 * If the user has already seen the movie, the existing row is updated with a new
 * seen_at timestamp. This table is used to avoid recommending the same movie
 * again within the user's recent history.
 *
 * @property supabase - Supabase client used for database access.
 * @property userId - Authenticated user's ID.
 * @property tmdbId - TMDb movie ID.
 *
 * @throws Error if the database upsert fails.
 */
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