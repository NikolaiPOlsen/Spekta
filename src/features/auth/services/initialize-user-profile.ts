import { supabase } from '@/lib/supabase';

type InitializeUserProfileResponse = {
  message: string;
  user_id: string;
  initialized_weights: number;
};

export async function initializeUserProfile() {
  const { data, error } = await supabase.functions.invoke<InitializeUserProfileResponse>(
    'initialize-user-profile',
  );

  if (error) {
    throw new Error(error.message || 'Failed to initialize user weights');
  }

  return data;
}
