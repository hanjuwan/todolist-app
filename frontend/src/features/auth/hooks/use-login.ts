import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login } from '@/features/auth/api/auth-api';
import { useAuthStore } from '@/features/auth/store/auth-store';
import type { LoginRequest } from '@/features/auth/types/auth.types';

export function useLogin() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: ({ accessToken, user }) => {
      setToken(accessToken, user);
      navigate('/todos');
    },
  });
}
