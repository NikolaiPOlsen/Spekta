import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { UserParameterWeight, UsesUserId } from "../_shared/properties";
import { parameterTypeNames } from "../_shared/parameters-type-names";

// Type for raw supabase query result
type UserParameterWeightRow = {
    weight: number | string;
    interaction_count: number | null;
    parameters: {
        parameter_type: string;
        parameter_value: string;
    };
};

export async function getWeightsFromDb(
    supabase: SupabaseClient,
    userId: string,
    type: string
): Promise<UserParameterWeight[]> {
    const { data, error } = await supabase
        .from("user_parameter_weights")
        .select(`
            weight,
            interaction_count,
            parameters!inner (
                parameter_type,
                parameter_value
            )
        `)
        .eq("user_id", userId)
        .eq("parameters.parameter_type", type);


    if (error) {
        throw new Error(`Failed to fetch user parameter weights: ${error.message}`);
    }

    return ((data ?? []) as UserParameterWeightRow[]).map((row) => ({
        parameter_type: row.parameters.parameter_type,
        parameter_value: row.parameters.parameter_value,
        weight: Number(row.weight),
        interaction_count: row.interaction_count ?? 0,
    }));
}

const getUserWeights = async ({ userId }: UsesUserId) => {
    parameterTypeNames.forEach(parameterType => {

    });
}