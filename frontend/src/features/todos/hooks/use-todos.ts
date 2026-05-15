import { useQuery } from '@tanstack/react-query';
import { getTodos } from '@/features/todos/api/todos-api';
import type { TodoListFilters } from '@/features/todos/types/todo.types';

export function todosQueryKey(filters: TodoListFilters) {
  return ['todos', filters] as const;
}

export function useTodos(filters: TodoListFilters = {}) {
  return useQuery({
    queryKey: todosQueryKey(filters),
    queryFn: () => getTodos(filters),
  });
}
