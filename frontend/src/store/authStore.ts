import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      updateUser: (partial) => set((s) => ({ user: s.user ? { ...s.user, ...partial } : s.user })),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'tutash-auth' },
  ),
);
