import { create } from 'zustand';
import type { User } from '@/features/users/types/user.types';
import type { AuthState } from '@/features/auth/types/auth.types';

interface AuthStore extends AuthState {
  setToken: (token: string, user: User) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  setToken: (token, user) => set({ token, user, isAuthenticated: true }),
  clearToken: () => set({ token: null, user: null, isAuthenticated: false }),
}));
