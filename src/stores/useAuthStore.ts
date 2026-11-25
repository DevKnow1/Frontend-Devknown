import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role, User } from '../types/api';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setSession: (accessToken: string, user: User) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
  hasRole: (roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,

      setSession: (accessToken, user) => set({ accessToken, user }),

      setUser: (user) => set({ user }),

      clearSession: () => set({ accessToken: null, user: null }),

      hasRole: (roles) => {
        const currentRole = get().user?.role;
        return currentRole ? roles.includes(currentRole) : false;
      },
    }),
    {
      name: 'devknow-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    }
  )
);