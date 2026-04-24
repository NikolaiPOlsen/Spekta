import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Type for returned weights
export type UserParameterWeight = {
    parameter_type: string;
    parameter_value: string;
    weight: number;
    interaction_count: number;
};

export interface getAPIRequestProperties {
    supabaseClientInstance: SupabaseClient
    userId: string;
    addRandomness?: boolean;
};

// export interface APIRequestParameter {
//     value: string;
// };

export interface APIRequestTypeParameter {
    positive: boolean;
    with_type: string;
    parameters: string[];
};


/**
 * Parameters used to build a TMDb API request URL for fetching movies with optional filtering
 * and randomization behavior.
 *
 * @property includeAdult - Include adult content in results.
 * @property parameters - Array of API filter parameters (e.g. genres, dates, ratings).
 * @property languagePreference - The language preference of the movie. Leave blank to disable.
 *
 * @property randomPage - If true, selects a random page; if [min, max], picks a page in range.
 * @property randomSorting - Randomizes sorting parameters.
 *
 * **For all below:** If true, uses APIRequestParameterAmount.
 * Specify a number to decide how many random genres/cast to specify.
 * 
 * @property randomWithGenres
 * @property randomWithCast
 * @property randomWithoutGenres
 * @property randomWithoutCast
 */
export interface BuildAPIRequestURLSpecification {
    includeAdult: boolean;
    parameters: APIRequestTypeParameter[];
    languagePreference?: string;
    randomPage?: boolean | [number, number];
    randomSorting?: boolean;
    randomWithGenres?: boolean | number;
    randomWithCast?: boolean | number;
    randomWithoutGenres?: boolean | number;
    randomWithoutCast?: boolean | number;
}

// export interface UsesUserId {
//     userId: string;
// };