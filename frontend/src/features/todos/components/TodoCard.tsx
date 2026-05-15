import type { Todo } from '@/features/todos/types/todo.types';
import { getCategoryColor } from '@/shared/utils/category-color';

function formatPeriod(start: string | null, end: string | null): string {
  if (start && end) return `기간: ${start} ~ ${end}`;
  if (end) return `마감: ${end}`;
  if (start) return `시작: ${start}`;
  return '';
}

interface TodoCardProps {
  todo: Todo;
  categoryName?: string;
  onToggle?: (isCompleted: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TodoCard({ todo, categoryName, onToggle, onEdit, onDelete }: TodoCardProps) {
  const color = getCategoryColor(todo.categoryId);
  return (
    <div
      data-testid={`todo-card-${todo.id}`}
      style={{
        border: '1px solid var(--color-border)',
        borderLeft: `4px solid ${color.dot}`,
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        boxShadow: 'var(--shadow-sm)',
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="checkbox"
          checked={todo.isCompleted}
          onChange={() => {}}
          onClick={() => onToggle?.(!todo.isCompleted)}
          style={{ width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0 }}
        />
        <span
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--color-text)',
            textDecoration: todo.isCompleted ? 'line-through' : 'none',
            flex: 1,
          }}
        >
          {todo.title}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => onEdit?.()}
            style={{
              height: '32px',
              padding: '0 12px',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg)',
              color: 'var(--color-text-muted)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            수정
          </button>
          <button
            type="button"
            onClick={() => onDelete?.()}
            style={{
              height: '32px',
              padding: '0 12px',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg)',
              color: 'var(--color-danger)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            삭제
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {categoryName && (
          <span
            data-testid="todo-card-category-chip"
            style={{
              padding: '2px 10px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 600,
              fontSize: '12px',
              background: color.bg,
              color: color.text,
            }}
          >
            {categoryName}
          </span>
        )}
        {(todo.startDate || todo.dueDate) && (
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {formatPeriod(todo.startDate, todo.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}
