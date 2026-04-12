/**
 * Renders the dynamic movie detail route for an individual movie.
 */

import { useLocalSearchParams } from 'expo-router';

import { MovieDetailScreen } from '@/features/movies/components';

export default function MovieDetailRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return <MovieDetailScreen movieId={id ?? 'unknown'} />;
}
