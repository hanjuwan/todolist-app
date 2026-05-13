import { useMutation } from '@tanstack/react-query';
import { register } from '@/features/auth/api/auth-api';
import type { RegisterRequest } from '@/features/auth/types/auth.types';
import type { User } from '@/features/users/types/user.types';
import type { ApiError } from '@/shared/types';

export function useRegister() {
  return useMutation<User, ApiError, RegisterRequest>({
    mutationFn: register,
  });
}
