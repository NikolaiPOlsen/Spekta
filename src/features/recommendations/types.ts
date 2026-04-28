/**
 * Defines shared types for the recommendations feature.
 */

export type RecommendationMovie = {
  id: number;
  genreIds: number[];
  releaseDate: string | null;
  popularity: number;
  voteAverage: number;
  voteCount: number;
  adult: boolean;
  title: string;
  posterPath: string | null;
  overview: string;
  actorIds?: number[];
  runtime?: number;
};

export type RecommendationResponse = {
  apiRequest?: string;
  recommendations: RecommendationMovie[];
};

export type SwipeParameter = {
  parameter_type: string;
  parameter_value: string;
};
