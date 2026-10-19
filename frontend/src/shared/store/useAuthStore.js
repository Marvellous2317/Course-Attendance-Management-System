// src/shared/store/useAuthStore.js
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  requiresPasswordChange: false,
  isAuthenticated: false,
  resetEmail: null,
};

// One-time cleanup of the old manual keys (safe to delete after a release or two)
try {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
} catch {
  /* storage unavailable */
}

export const useAuthStore = create(
  persist(
    (set) => ({
      ...initialState,

      setAuth: (user, token, refreshToken = null) =>
        set({
          user,
          token,
          refreshToken,
          // adjust the field name to whatever your backend sends
          requiresPasswordChange: Boolean(user?.require_password_change),
          isAuthenticated: Boolean(token && user),
        }),

      // Used by the Axios interceptor after a silent refresh
      setTokens: (token, refreshToken) =>
        set((state) => ({
          token,
          refreshToken: refreshToken ?? state.refreshToken,
          isAuthenticated: Boolean(token && state.user),
        })),

      setUser: (user) =>
        set((state) => ({
          user,
          isAuthenticated: Boolean(state.token && user),
        })),

      setRequiresPasswordChange: (value) =>
        set({ requiresPasswordChange: value }),

      setResetEmail: (email) => set({ resetEmail: email }),

      clearSession: () => set({ ...initialState }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),

      // isAuthenticated is NOT saved; it's recomputed on load (see merge)
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        requiresPasswordChange: state.requiresPasswordChange,
        resetEmail: state.resetEmail,
      }),

      // Runs when the saved data is loaded. A tampered or half-cleared
      // storage entry can't produce a fake "logged in" state.
      merge: (persisted, current) => {
        const merged = { ...current, ...persisted };
        merged.isAuthenticated = Boolean(merged.token && merged.user);
        return merged;
      },
    },
  ),
);