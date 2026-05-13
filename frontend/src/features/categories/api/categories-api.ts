import { apiClient } from '@/lib/api-client';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/features/categories/types/category.types';

export async function listCategories(): Promise<Category[]> {
  const res = await apiClient.get<Category[]>('/categories');
  return res.data;
}

export async function createCategory(body: CreateCategoryRequest): Promise<Category> {
  const res = await apiClient.post<Category>('/categories', body);
  return res.data;
}

export async function updateCategory(id: string, body: UpdateCategoryRequest): Promise<Category> {
  const res = await apiClient.patch<Category>(`/categories/${id}`, body);
  return res.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}
