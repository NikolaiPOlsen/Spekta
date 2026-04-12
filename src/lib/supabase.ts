/**
 * Configures the shared Supabase client used by feature services.
 */

import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

import { env } from '@/config/env';

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
