import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Enquanto o projeto Supabase não é configurado (ver README), o app roda inteiro
 * com dados de exemplo em src/lib/mockData.ts. Assim que EXPO_PUBLIC_SUPABASE_URL e
 * EXPO_PUBLIC_SUPABASE_ANON_KEY existirem no .env, isMockMode passa a false e as
 * telas devem trocar as chamadas de mockData pelas queries reais ao Supabase.
 */
export const isMockMode = !supabaseUrl || !supabaseAnonKey;

export const supabase = isMockMode
  ? null
  : createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
