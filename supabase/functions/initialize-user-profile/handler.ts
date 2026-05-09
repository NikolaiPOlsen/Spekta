import { createUserClient } from "../_shared/supabase-create-client.ts";
import { ParameterTypeName } from "../_shared/parameter-type-names.ts";

function getRandomStartingWeight() {
  return Math.random() * 0.2 - 0.1;
}

export async function handleInitializeUserProfile(
  req: Request,
  createClient = createUserClient,
) {
  try {
    const supabase = createClient(req);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: existingWeights, error: existingWeightsError } = await supabase
      .from("user_parameter_weights")
      .select("parameter_id")
      .eq("user_id", user.id)
      .limit(1);

    if (existingWeightsError) {
      throw new Error(`Failed to check existing user weights: ${existingWeightsError.message}`);
    }

    if ((existingWeights ?? []).length > 0) {
      return new Response(
        JSON.stringify({
          message: "User weights already initialized",
          user_id: user.id,
          initialized_weights: 0,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { data: genreParameters, error: parametersError } = await supabase
      .from("parameters")
      .select("id")
      .eq("parameter_type", ParameterTypeName.Genre);

    if (parametersError) {
      throw new Error(`Failed to fetch genre parameters: ${parametersError.message}`);
    }

    const rows = (genreParameters ?? []).map((parameter) => ({
      user_id: user.id,
      parameter_id: parameter.id,
      weight: getRandomStartingWeight(),
      interaction_count: 0,
      updated_at: new Date().toISOString(),
    }));

    const { error: weightsError } = await supabase
      .from("user_parameter_weights")
      .upsert(rows, {
        onConflict: "user_id,parameter_id",
        ignoreDuplicates: true,
      });

    if (weightsError) {
      throw new Error(`Failed to initialize user weights: ${weightsError.message}`);
    }

    return new Response(
      JSON.stringify({
        message: "User weights initialized",
        user_id: user.id,
        initialized_weights: rows.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
