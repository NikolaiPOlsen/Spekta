/**
 * Defines shared types for the recommendations feature.
 */

export type RecommendationMovie = {
  tmdb_id: number;
  genre_ids: number[];
  release_date: string | null;
  popularity: number;
  vote_average: number;
  vote_count: number;
  adult: boolean;
  name: string;
  poster_path: string | null;
  overview: string;
};

export type RecommendationResponse = {
  apiRequest?: string;
  movies: RecommendationMovie[];
};

export type SwipeParameter = {
  parameter_type: string;
  parameter_value: string;
};
