import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createUserClient } from "../_shared/supabase-create-client.ts";
import { ParameterTypeName } from "../_shared/parameter-type-names.ts";

function getRandomStartingWeight() {
  return Math.random() * 0.2 - 0.1;
}

serve(async (req) => {
  try {
    const supabase = createUserClient(req);

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
        message: "User profile initialized",
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
});