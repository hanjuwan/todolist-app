import { apiClient } from '@/lib/api-client';
import type { LoginRequest, RegisterRequest, LoginResponse } from '@/features/auth/types/auth.types';
import type { User } from '@/features/users/types/user.types';
import type { ApiSuccessResponse } from '@/shared/types';

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<ApiSuccessResponse<LoginResponse>>('/auth/login', data);
  return res.data.data;
}

export async function register(data: RegisterRequest): Promise<User> {
  const res = await apiClient.post<ApiSuccessResponse<User>>('/auth/register', data);
  return res.data.data;
}
