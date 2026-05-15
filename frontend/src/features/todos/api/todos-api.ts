import { apiClient } from '@/lib/api-client';
import type { Todo, TodoListFilters, CreateTodoRequest, UpdateTodoRequest } from '@/features/todos/types/todo.types';
import type { Pagination } from '@/shared/types';

interface GetTodosResponse {
  todos: Todo[];
  pagination: Pagination;
}

export async function getTodos(filters: TodoListFilters = {}): Promise<GetTodosResponse> {
  const params: Record<string, string | number> = {};

  if (filters.categoryId !== undefined) params.categoryId = filters.categoryId;
  if (filters.isCompleted !== undefined) params.isCompleted = String(filters.isCompleted);
  if (filters.dueDateFrom !== undefined) params.dueDateFrom = filters.dueDateFrom;
  if (filters.dueDateTo !== undefined) params.dueDateTo = filters.dueDateTo;
  if (filters.keyword !== undefined) params.keyword = filters.keyword;
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.limit !== undefined) params.limit = filters.limit;

  const res = await apiClient.get<{ success: true; data: Todo[]; pagination: Pagination }>('/todos', { params });
  return { todos: res.data.data, pagination: res.data.pagination };
}

export async function createTodo(data: CreateTodoRequest): Promise<Todo> {
  const res = await apiClient.post<{ success: true; data: Todo }>('/todos', data);
  return res.data.data;
}

export async function updateTodo(id: string, data: UpdateTodoRequest): Promise<Todo> {
  const res = await apiClient.patch<{ success: true; data: Todo }>(`/todos/${id}`, data);
  return res.data.data;
}

export async function toggleTodoComplete(id: string, isCompleted: boolean): Promise<Todo> {
  const res = await apiClient.patch<{ success: true; data: Todo }>(`/todos/${id}/complete`, { isCompleted });
  return res.data.data;
}

export async function deleteTodo(id: string): Promise<void> {
  await apiClient.delete(`/todos/${id}`);
}
