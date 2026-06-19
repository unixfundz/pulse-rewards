import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (access: string, refresh: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const data = await apiClient.post<{
          user: User;
          accessToken: string;
          refreshToken: string;
        }>('/auth/login', { email, password });

        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        });
      },

      logout: async () => {
        const { refreshToken } = get();
        if (refreshToken) {
          await apiClient.post('/auth/logout', { refreshToken }).catch(() => null);
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh }),
    }),
    { name: 'pulse-auth', partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken, isAuthenticated: s.isAuthenticated }) }
  )
);
