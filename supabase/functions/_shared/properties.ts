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
    randomWeightOffset?: boolean;
    randomizeURLParameters?: boolean;
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
 */
export interface BuildAPIRequestURLSpecification {
    tmdbData: tmdbData;
    parameters: APIRequestTypeParameter[];
    languagePreference?: string;
    includeAdult?: boolean;
    randomPage?: boolean | [number, number];
    randomSorting?: boolean;
}

export type SwipeParameter = {
    parameter_type: string;
    parameter_value: string;
};

export type RecordSwipeBody = {
    tmdb_id: string;
    liked: boolean;
    parameters: SwipeParameter[];
};

export type ParameterRow = {
    id: string;
    parameter_type: string;
    parameter_value: string;
};

export type UserSettings = {
    user_id: string;
    preferred_media_type: string;
    include_adult: boolean;
    preferred_language: string | null;
    preferred_region: string | null;
    recommendations_per_batch: number;
};

export interface GenericMovieAPIFetch {
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    id: number;
    title: string;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
}

export interface GenericMovie {
    adult: boolean;
    backdropPath: string;
    genreIds: number[];
    id: number;
    title: string;
    originalLanguage: string;
    originalTitle: string;
    overview: string;
    popularity: number;
    posterPath: string;
    releaseDate: string;
    video: boolean;
    voteAverage: number;
    voteCount: number;
}

export interface DetailedMovie extends GenericMovie {
    actorIds?: number[];
    runtime?: number;
    keywordIds?: number[];
}

// export interface UsesUserId {
//     userId: string;
// };