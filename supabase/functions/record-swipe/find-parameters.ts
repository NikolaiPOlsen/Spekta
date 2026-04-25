import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SwipeParameter } from "../_shared/properties.ts";
import { ParameterRow } from "../_shared/types.ts";

type FindParametersInput = {
  supabase: SupabaseClient;
  requestedParameters: SwipeParameter[];
};

export async function findParameters({
  supabase,
  requestedParameters,
}: FindParametersInput): Promise<ParameterRow[]> {
  if (requestedParameters.length === 0) {
    return [];
  }

  const requestedKeys = new Set(
    requestedParameters.map(
      (parameter) =>
        `${parameter.parameter_type}:${parameter.parameter_value}`,
    ),
  );

  const uniqueValues = [
    ...new Set(
      requestedParameters.map((parameter) => parameter.parameter_value),
    ),
  ];

  const { data, error } = await supabase
    .from("parameters")
    .select("id, parameter_type, parameter_value")
    .in("parameter_value", uniqueValues);

  if (error) {
    throw new Error(`Failed to fetch parameters: ${error.message}`);
  }

  return ((data ?? []) as ParameterRow[]).filter((parameter) =>
    requestedKeys.has(`${parameter.parameter_type}:${parameter.parameter_value}`)
  );
}