import { useMutation } from '@tanstack/react-query';
import { login } from '@/features/auth/api/auth-api';
import { useAuthStore } from '@/features/auth/store/auth-store';
import type { LoginRequest, LoginResponse } from '@/features/auth/types/auth.types';
import type { ApiError } from '@/shared/types';

export function useLogin() {
  const setToken = useAuthStore((s) => s.setToken);
  return useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: login,
    onSuccess: ({ accessToken, user }) => {
      setToken(accessToken, user);
    },
  });
}
