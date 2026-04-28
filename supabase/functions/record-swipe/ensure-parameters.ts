import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SwipeParameter } from "../_shared/properties.ts";

export type ParameterRow = {
  id: string;
  parameter_type: string;
  parameter_value: string;
};

type EnsureParametersInput = {
  supabase: SupabaseClient;
  requestedParameters: SwipeParameter[];
};

/**
 * Ensures that all parameters from a swipe exist in the global parameters table.
 *
 * Missing parameters are inserted using parameter_type and parameter_value.
 * Existing parameters are left unchanged.
 *
 * @property supabase - Supabase client used for database access.
 * @property requestedParameters - Parameters extracted from the swiped movie.
 *
 * @returns Matching parameter rows including their database UUIDs.
 *
 * @throws Error if inserting or fetching parameters fails.
 */
export async function ensureParameters({
  supabase,
  requestedParameters,
}: EnsureParametersInput): Promise<ParameterRow[]> {
  if (requestedParameters.length === 0) {
    return [];
  }

  const uniqueParameters = Array.from(
    new Map(
      requestedParameters.map((parameter) => [
        `${parameter.parameter_type}:${parameter.parameter_value}`,
        parameter,
      ]),
    ).values(),
  );

  const { error: insertError } = await supabase
    .from("parameters")
    .upsert(uniqueParameters, {
      onConflict: "parameter_type,parameter_value",
      ignoreDuplicates: true,
    });

  if (insertError) {
    throw new Error(`Failed to ensure parameters: ${insertError.message}`);
  }

  const requestedKeys = new Set(
    uniqueParameters.map(
      (parameter) => `${parameter.parameter_type}:${parameter.parameter_value}`,
    ),
  );

  const uniqueValues = [
    ...new Set(uniqueParameters.map((parameter) => parameter.parameter_value)),
  ];

  const { data, error: fetchError } = await supabase
    .from("parameters")
    .select("id, parameter_type, parameter_value")
    .in("parameter_value", uniqueValues);

  if (fetchError) {
    throw new Error(`Failed to fetch ensured parameters: ${fetchError.message}`);
  }

  return ((data ?? []) as ParameterRow[]).filter((parameter) =>
    requestedKeys.has(`${parameter.parameter_type}:${parameter.parameter_value}`)
  );
}