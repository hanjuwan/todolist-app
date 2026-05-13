import { useQuery } from '@tanstack/react-query';
import { listCategories } from '@/features/categories/api/categories-api';

export const categoriesQueryKey = ['categories'] as const;

export function useCategories() {
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: listCategories,
    staleTime: 5 * 60_000,
  });
}
