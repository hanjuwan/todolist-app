import { apiClient } from '@/lib/api-client';
import type {
  UpdateProfileRequest,
  User,
  WithdrawRequest,
} from '@/features/users/types/user.types';

export async function getMe(): Promise<User> {
  const res = await apiClient.get<User>('/users/me');
  return res.data;
}

export async function updateProfile(body: UpdateProfileRequest): Promise<User> {
  const res = await apiClient.patch<User>('/users/me', body);
  return res.data;
}

export async function withdraw(body: WithdrawRequest): Promise<void> {
  await apiClient.delete('/users/me', { data: body });
}
