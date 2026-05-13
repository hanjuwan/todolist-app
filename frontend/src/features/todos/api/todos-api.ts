import { apiClient } from '@/lib/api-client';
import type {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  ToggleCompleteRequest,
  TodoListFilters,
} from '@/features/todos/types/todo.types';
import type { PaginatedResponse } from '@/shared/types';

function toQuery(filters: TodoListFilters): Record<string, string | number | boolean> {
  const q: Record<string, string | number | boolean> = {};
  if (filters.categoryId) q.categoryId = filters.categoryId;
  if (filters.isCompleted !== undefined) q.isCompleted = filters.isCompleted;
  if (filters.dueDateFrom) q.dueDateFrom = filters.dueDateFrom;
  if (filters.dueDateTo) q.dueDateTo = filters.dueDateTo;
  if (filters.keyword) q.keyword = filters.keyword;
  if (filters.page) q.page = filters.page;
  if (filters.limit) q.limit = filters.limit;
  return q;
}

export async function listTodos(filters: TodoListFilters = {}): Promise<PaginatedResponse<Todo>> {
  const res = await apiClient.get<PaginatedResponse<Todo>>('/todos', { params: toQuery(filters) });
  return res.data;
}

export async function getTodo(id: string): Promise<Todo> {
  const res = await apiClient.get<Todo>(`/todos/${id}`);
  return res.data;
}

export async function createTodo(body: CreateTodoRequest): Promise<Todo> {
  const res = await apiClient.post<Todo>('/todos', body);
  return res.data;
}

export async function updateTodo(id: string, body: UpdateTodoRequest): Promise<Todo> {
  const res = await apiClient.patch<Todo>(`/todos/${id}`, body);
  return res.data;
}

export async function toggleTodoComplete(id: string, body: ToggleCompleteRequest): Promise<Todo> {
  const res = await apiClient.patch<Todo>(`/todos/${id}/complete`, body);
  return res.data;
}

export async function deleteTodo(id: string): Promise<void> {
  await apiClient.delete(`/todos/${id}`);
}
