import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTodo, updateTodo, toggleTodoComplete, deleteTodo } from '@/features/todos/api/todos-api';
import type { CreateTodoRequest, UpdateTodoRequest, Todo } from '@/features/todos/types/todo.types';
import type { Pagination } from '@/shared/types';

type TodosQueryData = { todos: Todo[]; pagination: Pagination };

export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTodoRequest) => createTodo(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) => updateTodo(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useToggleTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      toggleTodoComplete(id, isCompleted),
    onMutate: async ({ id, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      const previousQueries = queryClient.getQueriesData<TodosQueryData>({ queryKey: ['todos'] });

      queryClient.setQueriesData<TodosQueryData>({ queryKey: ['todos'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          todos: old.todos.map((t) =>
            t.id === id ? { ...t, isCompleted, completedAt: isCompleted ? new Date().toISOString() : null } : t,
          ),
        };
      });

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
