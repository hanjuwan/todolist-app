import { useMemo, useState } from 'react';
import AppHeader from '@/shared/components/AppHeader';
import FilterBar from '@/features/todos/components/FilterBar';
import TodoCard from '@/features/todos/components/TodoCard';
import TodoModal from '@/features/todos/components/TodoModal';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import { useTodos } from '@/features/todos/hooks/use-todos';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { toUserMessage } from '@/shared/utils/error-message';
import {
  useDeleteTodo,
  useToggleTodoComplete,
} from '@/features/todos/hooks/use-todo-mutations';
import type { Todo, TodoListFilters } from '@/features/todos/types/todo.types';

export default function TodoListPage() {
  const [filters, setFilters] = useState<TodoListFilters>({});
  const [modalState, setModalState] = useState<{ open: boolean; todo: Todo | null }>({
    open: false,
    todo: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<Todo | null>(null);

  const { data: categoriesData } = useCategories();
  const categories = useMemo(() => categoriesData ?? [], [categoriesData]);
  const { data, isLoading, isError, error } = useTodos(filters);
  const toggleMutation = useToggleTodoComplete();
  const deleteMutation = useDeleteTodo();

  const items = data?.items ?? [];
  const filtersApplied = Object.values(filters).some((v) => v !== undefined && v !== '');

  function openCreate() {
    setModalState({ open: true, todo: null });
  }
  function openEdit(todo: Todo) {
    setModalState({ open: true, todo });
  }
  function closeModal() {
    setModalState({ open: false, todo: null });
  }
  function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    deleteMutation.mutate(id);
  }

  return (
    <div data-testid="page-todos">
      <AppHeader />
      <FilterBar value={filters} onChange={setFilters} categories={categories} />

      <section aria-label="할일 목록">
        <header>
          <h2>할일 목록</h2>
          <button type="button" data-testid="add-todo-btn" onClick={openCreate}>
            + 새 할일 추가
          </button>
        </header>

        {isLoading && <p data-testid="todos-loading">불러오는 중...</p>}

        {isError && (
          <p role="alert" data-testid="todos-error">
            {toUserMessage(error)}
          </p>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div data-testid="todos-empty">
            {filtersApplied ? (
              <>
                <p>해당 조건에 맞는 할일이 없습니다.</p>
                <button type="button" onClick={() => setFilters({})}>
                  필터 초기화
                </button>
              </>
            ) : (
              <>
                <p>할일이 없습니다. 첫 번째 할일을 등록해 보세요!</p>
                <button type="button" onClick={openCreate}>
                  + 새 할일 추가
                </button>
              </>
            )}
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <ul data-testid="todos-list">
            {items.map((todo) => (
              <li key={todo.id}>
                <TodoCard
                  todo={todo}
                  category={categories.find((c) => c.id === todo.categoryId)}
                  onToggle={(t) =>
                    toggleMutation.mutate({ id: t.id, isCompleted: !t.isCompleted })
                  }
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  isToggling={
                    toggleMutation.isPending && toggleMutation.variables?.id === todo.id
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <TodoModal
        open={modalState.open}
        onClose={closeModal}
        todo={modalState.todo}
        categories={categories}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="할일을 삭제하시겠습니까?"
        description={deleteTarget ? `"${deleteTarget.title}" 항목이 영구 삭제됩니다.` : ''}
        confirmLabel="삭제"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
