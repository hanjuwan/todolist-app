import type { Todo } from '@/features/todos/types/todo.types';
import type { Category } from '@/features/categories/types/category.types';

interface Props {
  todo: Todo;
  category?: Category;
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  isToggling?: boolean;
}

export default function TodoCard({ todo, category, onToggle, onEdit, onDelete, isToggling }: Props) {
  return (
    <article
      data-testid={`todo-card-${todo.id}`}
      aria-label={`할일: ${todo.title}`}
      style={{ textDecoration: todo.isCompleted ? 'line-through' : 'none' }}
    >
      <div>
        <input
          type="checkbox"
          checked={todo.isCompleted}
          onChange={() => onToggle(todo)}
          disabled={isToggling}
          aria-label={`완료 상태: ${todo.title}`}
          data-testid={`todo-toggle-${todo.id}`}
        />
        <span>{todo.title}</span>
        <span>[{category?.name ?? '카테고리'}]</span>
        <span>{todo.dueDate ?? '미설정'}</span>
        <button
          type="button"
          onClick={() => onEdit(todo)}
          data-testid={`todo-edit-${todo.id}`}
        >
          수정
        </button>
        <button
          type="button"
          onClick={() => onDelete(todo)}
          data-testid={`todo-delete-${todo.id}`}
        >
          삭제
        </button>
      </div>
      {todo.description && <p>{todo.description}</p>}
    </article>
  );
}
