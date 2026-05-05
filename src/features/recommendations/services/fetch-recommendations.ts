import { supabase } from '@/lib/supabase';

import type { RecommendationResponse } from '../types';

export async function fetchRecommendations(): Promise<RecommendationResponse> {
  const response = await supabase.functions.invoke<RecommendationResponse>(
    'get-recommendations',
  );

  // console.log(response);

  if (response.error) {
    throw new Error(response.error.message || 'Failed to load recommendations');
  }

  return {
    apiRequest: response.data?.apiRequest,
    recommendations: response.data?.recommendations ?? [],
  };
}
