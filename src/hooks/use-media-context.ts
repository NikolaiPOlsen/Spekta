import { createContext, useContext } from 'react';

import type { RecommendationMovie } from '@/features/recommendations/types';

export type MediaContextData = {
  isLoading: boolean;
  error: string | null;
  fetchRecommendationsBatch: () => Promise<RecommendationMovie[]>;
  persistSwipe: (movie: RecommendationMovie, liked: boolean) => Promise<void>;
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
