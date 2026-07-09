import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { User, AuthSession, AuthTokens } from '@/types';
import { STORAGE_KEYS } from '@/constants';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;

  // Actions
  setSession: (session: AuthSession) => void;
  updateUser: (user: Partial<User>) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        _hasHydrated: false,

        setHasHydrated: (state) => set({ _hasHydrated: state }),

        setSession: (session) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, session.tokens.accessToken);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, session.tokens.refreshToken);
            if (session.user.tenantId) {
              localStorage.setItem(STORAGE_KEYS.TENANT_ID, session.user.tenantId);
            }
          }
          set({
            user: session.user,
            tokens: session.tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        },

        updateUser: (userData) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...userData } : null,
          })),

        clearSession: () => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.TENANT_ID);
          }
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
          });
        },

        setLoading: (loading) => set({ isLoading: loading }),
      }),
      {
        name: 'auth-store',
        storage: createJSONStorage(() => localStorage),
        // Only persist these fields
        partialize: (state) => ({
          user: state.user,
          tokens: state.tokens,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
        // Critical: skip initial hydration to prevent SSR mismatch
        skipHydration: true,
      }
    ),
    { name: 'AuthStore' }
  )
);
