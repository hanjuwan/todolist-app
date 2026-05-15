import { create } from 'zustand';
import type { AuthState } from '@/features/auth/types/auth.types';

interface AuthStore extends AuthState {
  setToken: (token: string, user: AuthState['user']) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  setToken: (token, user) => set({ token, user, isAuthenticated: true }),
  clearToken: () => set({ token: null, user: null, isAuthenticated: false }),
}));
