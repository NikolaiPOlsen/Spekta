import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { clampWeight, updateWeight } from "./update-weight.ts";

type UpdateUserWeightsInput = {
  supabase: SupabaseClient;
  userId: string;
  parameterIds: string[];
  liked: boolean;
};

/**
 * Updates a user's stored parameter weights after a swipe.
 *
 * A liked movie moves the related parameter weights closer to 1.
 * A disliked movie moves the related parameter weights closer to -1.
 * Each updated parameter also has its interaction_count increased.
 *
 * @property supabase - Supabase client used for database access.
 * @property userId - Authenticated user's ID.
 * @property parameterIds - Database UUIDs of the parameters affected by the swipe.
 * @property liked - Whether the user liked the movie.
 *
 * @returns The updated user_parameter_weights rows prepared for upsert.
 *
 * @throws Error if fetching or updating weights fails.
 */
export async function updateUserWeights(...)
export async function updateUserWeights({
  supabase,
  userId,
  parameterIds,
  liked,
}: UpdateUserWeightsInput) {
  if (parameterIds.length === 0) {
    return [];
  }

  const { data: currentWeights, error: weightsError } = await supabase
    .from("user_parameter_weights")
    .select("parameter_id, weight, interaction_count")
    .eq("user_id", userId)
    .in("parameter_id", parameterIds);

  if (weightsError) {
    throw new Error(`Failed to fetch current weights: ${weightsError.message}`);
  }

  const updatedWeights = (currentWeights ?? []).map((row) => {
    const currentWeight = Number(row.weight);
    const currentInteractionCount = row.interaction_count ?? 0;

    const newWeight = clampWeight(
      updateWeight(currentWeight, {
        liked,
        learningRate: 0.1,
        addRandomness: true,
      }),
    );

    return {
      user_id: userId,
      parameter_id: row.parameter_id,
      weight: newWeight,
      interaction_count: currentInteractionCount + 1,
      updated_at: new Date().toISOString(),
    };
  });

  const { error: updateError } = await supabase
    .from("user_parameter_weights")
    .upsert(updatedWeights, {
      onConflict: "user_id,parameter_id",
    });

  if (updateError) {
    throw new Error(`Failed to update weights: ${updateError.message}`);
  }

  return updatedWeights;
}