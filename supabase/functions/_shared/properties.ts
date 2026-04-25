import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Type for returned weights
export type UserParameterWeight = {
    parameter_type: string;
    parameter_value: string;
    weight: number;
    interaction_count: number;
};

export interface tmdbData {
    APIKey: string;
    baseURL: string;
}

export interface getAPIRequestProperties {
    tmdbData: tmdbData;
    supabaseClientInstance: SupabaseClient
    userId: string;
    addRandomness?: boolean;
};

// export interface APIRequestParameter {
//     value: string;
// };

export interface APIRequestTypeParameter {
    positive: boolean;
    type: string;
    parameters: string[];
};




/**
 * Parameters used to build a TMDb API request URL for fetching movies with optional filtering
 * and randomization behavior.
 *
 * @property tmdbAPIKey - API key
 * @property tmdbBaseURL - API base URL
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
 *
 * @property userGenres - Must be present if `randomWithGenres` or `randomWithoutGenres` are set
 * @property userCast - Must be present if `randomWithCast` or `randomWithoutCast` are set
 */
export interface BuildAPIRequestURLSpecification {
    tmdbData: tmdbData;
    parameters: APIRequestTypeParameter[];
    languagePreference?: string;
    includeAdult?: boolean;
    randomPage?: boolean | [number, number];
    randomSorting?: boolean;
    randomWithGenres?: boolean | number;
    randomWithCast?: boolean | number;
    randomWithoutGenres?: boolean | number;
    randomWithoutCast?: boolean | number;
    userGenres?: string[];
    userCast?: string[];
}

// export interface UsesUserId {
//     userId: string;
// };