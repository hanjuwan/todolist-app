import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, updateProfile, withdraw } from '@/features/users/api/users-api';
import type { UpdateProfileRequest, User, WithdrawRequest } from '@/features/users/types/user.types';
import type { ApiError } from '@/shared/types';

export const meQueryKey = ['users', 'me'] as const;

export function useMe() {
  return useQuery({ queryKey: meQueryKey, queryFn: getMe });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation<User, ApiError, UpdateProfileRequest>({
    mutationFn: updateProfile,
    onSuccess: (user) => qc.setQueryData(meQueryKey, user),
  });
}

export function useWithdraw() {
  return useMutation<void, ApiError, WithdrawRequest>({
    mutationFn: withdraw,
  });
}
