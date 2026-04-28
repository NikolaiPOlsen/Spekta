import { createContext, useContext } from 'react';

import type { RecommendationMovie } from '@/features/recommendations/types';

export type MediaContextData = {
  recommendations: RecommendationMovie[];
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
  loadRecommendations: () => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  recordSwipe: (movie: RecommendationMovie, liked: boolean) => Promise<void>;
  clearMedia: () => void;
};

export const MediaContext = createContext<MediaContextData | undefined>(undefined);

export function useMediaContext() {
  const context = useContext(MediaContext);

  if (!context) {
    throw new Error('useMediaContext must be used within a MediaProvider');
  }

  return context;
}
