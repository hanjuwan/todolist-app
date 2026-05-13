import { useQuery } from '@tanstack/react-query';
import { listTodos } from '@/features/todos/api/todos-api';
import type { TodoListFilters } from '@/features/todos/types/todo.types';

export const todosQueryKey = (filters: TodoListFilters) => ['todos', filters] as const;

export function useTodos(filters: TodoListFilters) {
  return useQuery({
    queryKey: todosQueryKey(filters),
    queryFn: () => listTodos(filters),
  });
}
