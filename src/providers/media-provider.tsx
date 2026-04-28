import { useAuthContext } from '@/hooks/use-auth-context';
import { MediaContext } from '@/hooks/use-media-context';
import {
  fetchRecommendations,
  recordSwipe as saveSwipe,
} from '@/features/recommendations/services';
import type { RecommendationMovie } from '@/features/recommendations/types';
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';

export default function MediaProvider({ children }: PropsWithChildren) {
  const {
    claims,
    isLoading: isAuthLoading,
    isInitializingUser,
    isUserInitialized,
    initializationError,
  } = useAuthContext();
  const [recommendations, setRecommendations] = useState<RecommendationMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const clearMedia = useCallback(() => {
    setRecommendations([]);
    setError(null);
    setHasLoaded(false);
  }, []);

  const loadRecommendations = useCallback(async () => {
    if (!claims?.sub) {
      clearMedia();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchRecommendations();
      setRecommendations(response.movies);
      setHasLoaded(true);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load recommendations',
      );
    } finally {
      setIsLoading(false);
    }
  }, [claims?.sub, clearMedia]);

  const refreshRecommendations = useCallback(async () => {
    await loadRecommendations();
  }, [loadRecommendations]);

  const recordSwipe = useCallback(
    async (movie: RecommendationMovie, liked: boolean) => {
      await saveSwipe(movie, liked);
      setRecommendations((current) =>
        current.filter((currentMovie) => currentMovie.tmdb_id !== movie.tmdb_id),
      );
    },
    [],
  );

  useEffect(() => {
    if (isAuthLoading || isInitializingUser) {
      return;
    }

    if (!claims?.sub) {
      clearMedia();
      return;
    }

    if (!isUserInitialized && !initializationError) {
      return;
    }

    if (!hasLoaded) {
      void loadRecommendations();
    }
  }, [
    claims?.sub,
    clearMedia,
    hasLoaded,
    isAuthLoading,
    isInitializingUser,
    initializationError,
    isUserInitialized,
    loadRecommendations,
  ]);

  return (
    <MediaContext.Provider
      value={{
        recommendations,
        isLoading,
        error,
        hasLoaded,
        loadRecommendations,
        refreshRecommendations,
        recordSwipe,
        clearMedia,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
}
