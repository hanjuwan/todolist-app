import { apiClient } from '@/lib/api-client';
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/features/auth/types/auth.types';
import type { User } from '@/features/users/types/user.types';

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/auth/login', body);
  return res.data;
}

export async function register(body: RegisterRequest): Promise<User> {
  const res = await apiClient.post<User>('/auth/register', body);
  return res.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}
