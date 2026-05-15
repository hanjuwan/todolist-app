import { useEffect } from 'react';
import { getCategoryColor } from '@/shared/utils/category-color';
import type { Todo } from '@/features/todos/types/todo.types';
import type { Category } from '@/features/categories/types/category.types';

interface DayTodosDialogProps {
  date: string;
  todos: Todo[];
  categories: Category[];
  onClose: () => void;
  onEditTodo: (todo: Todo) => void;
}

function formatKoreanDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

function formatPeriod(start: string | null, end: string | null): string {
  if (start && end) return `기간: ${start} ~ ${end}`;
  if (end) return `마감: ${end}`;
  if (start) return `시작: ${start}`;
  return '';
}

export function DayTodosDialog({ date, todos, categories, onClose, onEditTodo }: DayTodosDialogProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function getCategoryName(categoryId: string): string {
    return categories.find((c) => c.id === categoryId)?.name ?? '';
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-dialog-title"
        style={{
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          width: '480px',
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: 'calc(100dvh - 48px)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h2
            id="day-dialog-title"
            style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}
          >
            {formatKoreanDate(date)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="다이얼로그 닫기"
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '18px',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {todos.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', margin: '16px 0' }}>
              이 날짜에 등록된 할일이 없습니다.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {todos.map((todo) => {
                const color = getCategoryColor(todo.categoryId);
                return (
                <div
                  key={todo.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '12px',
                    border: '1px solid var(--color-border)',
                    borderLeft: `4px solid ${color.dot}`,
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--color-text)',
                        textDecoration: todo.isCompleted ? 'line-through' : 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {todo.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span
                        data-testid="day-dialog-category-chip"
                        style={{
                          padding: '1px 8px',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: color.bg,
                          color: color.text,
                        }}
                      >
                        {getCategoryName(todo.categoryId)}
                      </span>
                      {(todo.startDate || todo.dueDate) && (
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {formatPeriod(todo.startDate, todo.dueDate)}
                        </span>
                      )}
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {todo.isCompleted ? '완료' : '미완료'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditTodo(todo)}
                    style={{
                      height: '32px',
                      padding: '0 12px',
                      border: '1px solid var(--color-border-strong)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg)',
                      color: 'var(--color-text-muted)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    수정
                  </button>
                </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              height: '40px',
              padding: '0 20px',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg)',
              color: 'var(--color-text-muted)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
