import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/features/categories/api/categories-api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
}
