import { useState } from 'react';
import { AppHeader } from '@/shared/components/AppHeader';
import { FilterBar } from '@/features/todos/components/FilterBar';
import { TodoCard } from '@/features/todos/components/TodoCard';
import { TodoModal } from '@/features/todos/components/TodoModal';
import { TodoCalendar } from '@/features/todos/components/TodoCalendar';
import { DayTodosDialog } from '@/features/todos/components/DayTodosDialog';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useTodos } from '@/features/todos/hooks/use-todos';
import { useToggleTodo, useDeleteTodo } from '@/features/todos/hooks/use-todo-mutations';
import { useCategories } from '@/features/categories/hooks/use-categories';
import type { Todo, TodoListFilters } from '@/features/todos/types/todo.types';

function hasActiveFilters(filters: TodoListFilters): boolean {
  return !!(
    filters.categoryId ||
    filters.isCompleted !== undefined ||
    filters.dueDateFrom ||
    filters.dueDateTo ||
    filters.keyword
  );
}

function isTodoOnDate(todo: Todo, date: string): boolean {
  const s = todo.startDate;
  const d = todo.dueDate;
  if (s && d) return s <= date && date <= d;
  if (s) return s === date;
  if (d) return d === date;
  return false;
}

export default function TodoListPage() {
  const [filters, setFilters] = useState<TodoListFilters>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: categoriesData } = useCategories();
  const { data: todosData, isLoading, isError } = useTodos(filters);
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();

  const categories = categoriesData ?? [];
  const todos = todosData?.todos ?? [];

  function getCategoryName(categoryId: string) {
    return categories.find((c) => c.id === categoryId)?.name;
  }

  function handleAddClick() {
    setEditingTodo(null);
    setIsModalOpen(true);
  }

  function handleModalClose() {
    setIsModalOpen(false);
    setEditingTodo(null);
  }

  function handleEditClick(todo: Todo) {
    setEditingTodo(todo);
    setIsModalOpen(true);
  }

  function handleDeleteClick(todo: Todo) {
    setDeletingTodoId(todo.id);
  }

  function handleDeleteConfirm() {
    if (!deletingTodoId) return;
    deleteTodo.mutate(deletingTodoId, {
      onSuccess: () => setDeletingTodoId(null),
    });
  }

  return (
    <div data-testid="todos-page" style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <AppHeader />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>할일 목록</h1>
          <button
            type="button"
            onClick={handleAddClick}
            style={{
              height: '40px',
              padding: '0 20px',
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            새 할일 추가
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <FilterBar filters={filters} onFiltersChange={setFilters} categories={categories} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <TodoCalendar todos={todos} onSelectDate={setSelectedDate} />
        </div>

        {isLoading && (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>불러오는 중...</p>
        )}

        {isError && (
          <p style={{ color: 'var(--color-danger)', textAlign: 'center' }}>오류가 발생했습니다.</p>
        )}

        {!isLoading && !isError && todos.length === 0 && !hasActiveFilters(filters) && (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>첫 번째 할일을 등록해 보세요!</p>
        )}

        {!isLoading && !isError && todos.length === 0 && hasActiveFilters(filters) && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>해당 조건에 맞는 할일이 없습니다.</p>
            <button
              type="button"
              onClick={() => setFilters({})}
              style={{
                height: '36px',
                padding: '0 16px',
                border: '1px solid var(--color-border-strong)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg)',
                color: 'var(--color-text-muted)',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              필터 초기화
            </button>
          </div>
        )}

        {!isLoading && !isError && todos.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {todos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                categoryName={getCategoryName(todo.categoryId)}
                onToggle={(isCompleted) => toggleTodo.mutate({ id: todo.id, isCompleted })}
                onEdit={() => handleEditClick(todo)}
                onDelete={() => handleDeleteClick(todo)}
              />
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <TodoModal
          todo={editingTodo ?? undefined}
          categories={categories}
          onClose={handleModalClose}
        />
      )}

      {selectedDate !== null && (
        <DayTodosDialog
          date={selectedDate}
          todos={todos.filter((t) => isTodoOnDate(t, selectedDate))}
          categories={categories}
          onClose={() => setSelectedDate(null)}
          onEditTodo={(todo) => {
            setSelectedDate(null);
            setEditingTodo(todo);
            setIsModalOpen(true);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={deletingTodoId !== null}
        title="할일 삭제"
        message="이 할일을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTodoId(null)}
        confirmLabel="확인"
        isLoading={deleteTodo.isPending}
      />
    </div>
  );
}
