import { apiClient } from '@/lib/api-client';
import type { Category } from '@/features/categories/types/category.types';

export async function getCategories(): Promise<Category[]> {
  const res = await apiClient.get<{ success: true; data: Category[] }>('/categories');
  return res.data.data;
}

export async function createCategory(name: string): Promise<Category> {
  const res = await apiClient.post<{ success: true; data: Category }>('/categories', { name });
  return res.data.data;
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  const res = await apiClient.patch<{ success: true; data: Category }>(`/categories/${id}`, { name });
  return res.data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}
