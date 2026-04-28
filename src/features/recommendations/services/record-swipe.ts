import { supabase } from '@/lib/supabase';

import type { RecommendationMovie, SwipeParameter } from '../types';

type RecordSwipePayload = {
  tmdb_id: string;
  liked: boolean;
  parameters: SwipeParameter[];
};

function buildSwipeParameters(movie: RecommendationMovie): SwipeParameter[] {
  return movie.genre_ids.map((genreId) => ({
    parameter_type: 'genre',
    parameter_value: String(genreId),
  }));
}

export async function recordSwipe(movie: RecommendationMovie, liked: boolean): Promise<void> {
  const payload: RecordSwipePayload = {
    tmdb_id: String(movie.tmdb_id),
    liked,
    parameters: buildSwipeParameters(movie),
  };

  const { error } = await supabase.functions.invoke('record-swipe', {
    body: payload,
  });

  if (error) {
    throw new Error(error.message || 'Failed to record swipe');
  }
}
