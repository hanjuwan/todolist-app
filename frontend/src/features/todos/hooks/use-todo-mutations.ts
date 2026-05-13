import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTodo,
  updateTodo,
  toggleTodoComplete,
  deleteTodo,
} from '@/features/todos/api/todos-api';
import type {
  CreateTodoRequest,
  Todo,
  UpdateTodoRequest,
} from '@/features/todos/types/todo.types';
import type { ApiError, PaginatedResponse } from '@/shared/types';

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation<Todo, ApiError, CreateTodoRequest>({
    mutationFn: createTodo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useUpdateTodo() {
  const qc = useQueryClient();
  return useMutation<Todo, ApiError, { id: string; body: UpdateTodoRequest }>({
    mutationFn: ({ id, body }) => updateTodo(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

interface ToggleArgs {
  id: string;
  isCompleted: boolean;
}

interface ToggleContext {
  snapshots: Array<[readonly unknown[], PaginatedResponse<Todo> | undefined]>;
}

export function useToggleTodoComplete() {
  const qc = useQueryClient();
  return useMutation<Todo, ApiError, ToggleArgs, ToggleContext>({
    mutationFn: ({ id, isCompleted }) => toggleTodoComplete(id, { isCompleted }),
    onMutate: async ({ id, isCompleted }) => {
      await qc.cancelQueries({ queryKey: ['todos'] });
      const lists = qc.getQueriesData<PaginatedResponse<Todo>>({ queryKey: ['todos'] });
      for (const [key, prev] of lists) {
        if (!prev) continue;
        qc.setQueryData<PaginatedResponse<Todo>>(key, {
          ...prev,
          items: prev.items.map((t) =>
            t.id === id
              ? {
                  ...t,
                  isCompleted,
                  completedAt: isCompleted ? new Date().toISOString() : null,
                }
              : t,
          ),
        });
      }
      return { snapshots: lists };
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      for (const [key, prev] of ctx.snapshots) {
        qc.setQueryData(key, prev);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: deleteTodo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
