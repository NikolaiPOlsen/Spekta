import { supabase } from '@/lib/supabase';

import type { RecommendationResponse } from '../types';

export async function fetchRecommendations(): Promise<RecommendationResponse> {
  const { data, error } = await supabase.functions.invoke<RecommendationResponse>(
    'get-recommendations',
  );

  if (error) {
    throw new Error(error.message || 'Failed to load recommendations');
  }

  return {
    apiRequest: data?.apiRequest,
    recommendations: data?.recommendations ?? [],
  };
}
