import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/features/users/api/users-api';

export function useMe() {
  return useQuery({ queryKey: ['users', 'me'], queryFn: getMe });
}
