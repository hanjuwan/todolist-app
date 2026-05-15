import type { User } from '@/features/users/types/user.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginResponse {
  accessToken: string;
  user: Pick<User, 'id' | 'email' | 'name'>;
}

export interface AuthState {
  token: string | null;
  user: Pick<User, 'id' | 'email' | 'name'> | null;
  isAuthenticated: boolean;
}
