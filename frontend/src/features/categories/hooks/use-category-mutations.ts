import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/features/categories/api/categories-api';
import { categoriesQueryKey } from '@/features/categories/hooks/use-categories';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/features/categories/types/category.types';
import type { ApiError } from '@/shared/types';

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation<Category, ApiError, CreateCategoryRequest>({
    mutationFn: createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesQueryKey }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation<Category, ApiError, { id: string; body: UpdateCategoryRequest }>({
    mutationFn: ({ id, body }) => updateCategory(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesQueryKey }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoriesQueryKey });
      qc.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
