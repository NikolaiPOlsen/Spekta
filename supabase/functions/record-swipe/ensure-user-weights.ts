import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

type EnsureUserWeightsInput = {
  supabase: SupabaseClient;
  userId: string;
  parameterIds: string[];
};

/**
 * Ensures that the current user has weight rows for the given parameters.
 *
 * New user_parameter_weights rows start at neutral weight 0.
 * Existing rows are left unchanged.
 *
 * @property supabase - Supabase client used for database access.
 * @property userId - Authenticated user's ID.
 * @property parameterIds - Database UUIDs of parameters that need user weights.
 *
 * @throws Error if inserting user weight rows fails.
 */
export async function ensureUserWeights({
  supabase,
  userId,
  parameterIds,
}: EnsureUserWeightsInput) {
  if (parameterIds.length === 0) {
    return;
  }

  const rows = parameterIds.map((parameterId) => ({
    user_id: userId,
    parameter_id: parameterId,
    weight: 0,
    interaction_count: 0,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("user_parameter_weights")
    .upsert(rows, {
      onConflict: "user_id,parameter_id",
      ignoreDuplicates: true,
    });

  if (error) {
    throw new Error(`Failed to ensure user weights: ${error.message}`);
  }
}