import { createClient, processLock } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

const isSSR = typeof window === 'undefined';
const CHUNK_SIZE = 1800;

const removeStoredValue = async (key: string) => {
  if (isSSR) return;

  const chunkCount = await SecureStore.getItemAsync(`${key}_chunkCount`);
  const count = Number.parseInt(chunkCount ?? '0', 10);

  if (Number.isFinite(count)) {
    for (let i = 0; i < count; i++) {
      await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
    }
  }

  await SecureStore.deleteItemAsync(`${key}_chunkCount`);
  await SecureStore.deleteItemAsync(key);
};

const ExpoWebSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (isSSR) return null;
    const chunkCount = await SecureStore.getItemAsync(`${key}_chunkCount`);
    if (!chunkCount) return SecureStore.getItemAsync(key);
    
    let value = '';
    for (let i = 0; i < parseInt(chunkCount); i++) {
      const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
      if (chunk) value += chunk;
    }
    return value;
  },

  setItem: async (key: string, value: string) => {
    if (isSSR) return;

    await removeStoredValue(key);

    if (value.length <= CHUNK_SIZE) {
      return SecureStore.setItemAsync(key, value);
    }
    const chunks = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < chunks; i++) {
      await SecureStore.setItemAsync(`${key}_chunk_${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
    }
    await SecureStore.setItemAsync(`${key}_chunkCount`, String(chunks));
  },
  
  removeItem: async (key: string) => {
    await removeStoredValue(key);
  },
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: ExpoWebSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  })
