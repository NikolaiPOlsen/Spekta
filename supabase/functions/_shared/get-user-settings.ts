import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { UserSettings } from "../_shared/properties.ts";

type UserSettingsRow = {
  user_id: string;
  preferred_media_type: string;
  include_adult: boolean;
  preferred_language: string | null;
  preferred_region: string | null;
  recommendations_per_batch: number | null;
};

/**
 * Fetches the settings row for a specific user.
 *
 * The returned object contains the user's recommendation/search preferences,
 * such as media type, adult-content setting, language, region, and batch size.
 *
 * @property supabase - Supabase client used for database access.
 * @property userId - Authenticated user's ID.
 *
 * @returns The user's settings row.
 *
 * @throws Error if the user settings row is missing or the database query fails.
 */
export async function getUserSettingsFromDb(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserSettings> {
  const { data, error } = await supabase
    .from("user_settings")
    .select(`
      user_id,
      preferred_media_type,
      include_adult,
      preferred_language,
      preferred_region,
      recommendations_per_batch
    `)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch user settings: ${error.message}`);
  }

  if (!data) {
    return { user_id:userId,
             preferred_media_type:'both', 
             include_adult:false, 
             preferred_language:null, 
             preferred_region: null,
             recommendations_per_batch: 20,
            };
  }

  const row = data as UserSettingsRow;

  return {
    user_id: row.user_id,
    preferred_media_type: row.preferred_media_type,
    include_adult: row.include_adult,
    preferred_language: row.preferred_language,
    preferred_region: row.preferred_region,
    recommendations_per_batch: row.recommendations_per_batch ?? 20,
  };
}