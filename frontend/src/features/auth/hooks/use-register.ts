import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { register } from '@/features/auth/api/auth-api';
import type { RegisterRequest } from '@/features/auth/types/auth.types';

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: () => {
      navigate('/login', { state: { registered: true } });
    },
  });
}
