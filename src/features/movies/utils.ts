/**
 * Defines plain helper utilities for the movies feature.
 */

import { TMDB_IMAGE_BASE_URL, TMDB_POSTER_SIZE } from "../../constants/app";

export const getPosterUrl = (
  posterPath: string | null,
  size = TMDB_POSTER_SIZE
) => {
  return posterPath ? `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}` : null;
};