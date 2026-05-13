import { useEffect, useState, type FormEvent } from 'react';
import { CreateTodoSchema } from '@/features/todos/todos.schemas';
import { useCreateTodo, useUpdateTodo } from '@/features/todos/hooks/use-todo-mutations';
import { toUserMessage } from '@/shared/utils/error-message';
import type { Todo } from '@/features/todos/types/todo.types';
import type { Category } from '@/features/categories/types/category.types';

interface Props {
  open: boolean;
  onClose: () => void;
  todo?: Todo | null;
  categories: Category[];
}

type FieldKey = 'categoryId' | 'title' | 'description' | 'dueDate';

export default function TodoModal({ open, onClose, todo, categories }: Props) {
  const isEdit = !!todo;
  const create = useCreateTodo();
  const update = useUpdateTodo();
  const pending = create.isPending || update.isPending;

  const [values, setValues] = useState({
    categoryId: '',
    title: '',
    description: '',
    dueDate: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFieldErrors({});
    setServerError(null);
    if (todo) {
      setValues({
        categoryId: todo.categoryId,
        title: todo.title,
        description: todo.description ?? '',
        dueDate: todo.dueDate ?? '',
      });
    } else {
      setValues({
        categoryId: categories[0]?.id ?? '',
        title: '',
        description: '',
        dueDate: '',
      });
    }
  }, [open, todo, categories]);

  if (!open) return null;

  function set<K extends FieldKey>(key: K, v: string) {
    setValues((p) => ({ ...p, [key]: v }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    const payload = {
      categoryId: values.categoryId,
      title: values.title.trim(),
      description: values.description.trim() ? values.description.trim() : undefined,
      dueDate: values.dueDate || undefined,
    };
    const parsed = CreateTodoSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Partial<Record<FieldKey, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as FieldKey;
        if (!errs[k]) errs[k] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    const onError = (err: unknown) => setServerError(toUserMessage(err));
    if (isEdit && todo) {
      update.mutate(
        { id: todo.id, body: parsed.data },
        { onSuccess: () => onClose(), onError },
      );
    } else {
      create.mutate(parsed.data, { onSuccess: () => onClose(), onError });
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="todo-modal-title" data-testid="todo-modal">
      <form onSubmit={handleSubmit} noValidate aria-label="할일 입력 폼">
        <h2 id="todo-modal-title">{isEdit ? '할일 수정' : '새 할일 추가'}</h2>
        {serverError && (
          <div role="alert" data-testid="todo-modal-error">
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="todo-title">제목</label>
          <input
            id="todo-title"
            value={values.title}
            onChange={(e) => set('title', e.target.value)}
            aria-invalid={!!fieldErrors.title}
          />
          {fieldErrors.title && <p role="alert">{fieldErrors.title}</p>}
        </div>

        <div>
          <label htmlFor="todo-description">설명</label>
          <textarea
            id="todo-description"
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="todo-due-date">마감일</label>
          <input
            id="todo-due-date"
            type="date"
            value={values.dueDate}
            onChange={(e) => set('dueDate', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="todo-category">카테고리</label>
          <select
            id="todo-category"
            value={values.categoryId}
            onChange={(e) => set('categoryId', e.target.value)}
            aria-invalid={!!fieldErrors.categoryId}
          >
            <option value="">선택하세요</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {fieldErrors.categoryId && <p role="alert">{fieldErrors.categoryId}</p>}
        </div>

        <div>
          <button type="button" onClick={onClose} data-testid="todo-modal-cancel">
            취소
          </button>
          <button type="submit" disabled={pending} data-testid="todo-modal-save">
            {pending ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
