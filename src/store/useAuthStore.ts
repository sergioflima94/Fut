import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

/**
 * Autenticação mock enquanto o Supabase não está conectado (ver src/lib/supabase.ts).
 * Quando isMockMode virar false, trocar login/logout pelas chamadas reais de
 * supabase.auth.signInWithPassword / signOut.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      login: () => set({ isLoggedIn: true }),
      logout: () => set({ isLoggedIn: false }),
    }),
    {
      name: 'pelada-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
