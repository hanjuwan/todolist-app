import { apiClient } from '@/lib/api-client';
import type { User, UpdateProfileRequest } from '@/features/users/types/user.types';
import type { ApiSuccessResponse } from '@/shared/types';

export async function getMe(): Promise<User> {
  const res = await apiClient.get<ApiSuccessResponse<User>>('/users/me');
  return res.data.data;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const res = await apiClient.patch<ApiSuccessResponse<User>>('/users/me', data);
  return res.data.data;
}

export async function withdrawAccount(currentPassword: string): Promise<void> {
  await apiClient.delete('/users/me', { data: { currentPassword } });
}
