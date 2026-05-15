import { useState, useEffect, type FormEvent } from 'react';
import { useCreateTodo, useUpdateTodo } from '@/features/todos/hooks/use-todo-mutations';
import { CreateTodoSchema, UpdateTodoSchema } from '@/features/todos/todos.schemas';
import type { Todo } from '@/features/todos/types/todo.types';
import type { Category } from '@/features/categories/types/category.types';

interface TodoModalProps {
  todo?: Todo;
  categories: Category[];
  onClose: () => void;
}

interface FormFields {
  title: string;
  categoryId: string;
  startDate: string;
  dueDate: string;
  description: string;
}

interface FieldErrors {
  title?: string;
  categoryId?: string;
  startDate?: string;
  dueDate?: string;
  description?: string;
}

export function TodoModal({ todo, categories, onClose }: TodoModalProps) {
  const isEditMode = todo !== undefined;
  const createMutation = useCreateTodo();
  const updateMutation = useUpdateTodo();

  const [fields, setFields] = useState<FormFields>({
    title: '',
    categoryId: categories[0]?.id ?? '',
    startDate: '',
    dueDate: '',
    description: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (todo) {
      setFields({
        title: todo.title,
        categoryId: todo.categoryId,
        startDate: todo.startDate ?? '',
        dueDate: todo.dueDate ?? '',
        description: todo.description ?? '',
      });
    }
  }, [todo]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleChange(field: keyof FormFields, value: string) {
    setFields((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setServerError(null);

    if (isEditMode) {
      const payload = {
        categoryId: fields.categoryId || undefined,
        title: fields.title || undefined,
        description: fields.description || undefined,
        startDate: fields.startDate || undefined,
        dueDate: fields.dueDate || undefined,
      };
      const result = UpdateTodoSchema.safeParse(payload);
      if (!result.success) {
        const errors: FieldErrors = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0] as keyof FieldErrors;
          errors[key] = issue.message;
        }
        setFieldErrors(errors);
        return;
      }
      try {
        await updateMutation.mutateAsync({ id: todo.id, data: result.data });
        onClose();
      } catch {
        setServerError('수정 중 오류가 발생했습니다.');
      }
    } else {
      const payload = {
        categoryId: fields.categoryId,
        title: fields.title,
        description: fields.description || undefined,
        startDate: fields.startDate || undefined,
        dueDate: fields.dueDate || undefined,
      };
      const result = CreateTodoSchema.safeParse(payload);
      if (!result.success) {
        const errors: FieldErrors = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0] as keyof FieldErrors;
          errors[key] = issue.message;
        }
        setFieldErrors(errors);
        return;
      }
      try {
        await createMutation.mutateAsync(result.data);
        onClose();
      } catch {
        setServerError('등록 중 오류가 발생했습니다.');
      }
    }
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
        aria-labelledby="todo-modal-title"
        style={{
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          width: '560px',
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: 'calc(100dvh - 24px)',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h2
            id="todo-modal-title"
            style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}
          >
            {isEditMode ? '할일 수정' : '새 할일 추가'}
          </h2>
        </div>

        <form noValidate onSubmit={(e) => void handleSubmit(e)} style={{ padding: '24px' }}>
          {serverError && (
            <div
              role="alert"
              style={{
                marginBottom: '16px',
                padding: '12px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-danger)',
                fontSize: '14px',
              }}
            >
              {serverError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                htmlFor="modal-title"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}
              >
                제목 <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                id="modal-title"
                type="text"
                value={fields.title}
                onChange={(e) => handleChange('title', e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  border: `1px solid ${fieldErrors.title ? 'var(--color-danger)' : 'var(--color-border-strong)'}`,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  color: 'var(--color-text)',
                  background: 'var(--color-bg)',
                  boxSizing: 'border-box',
                }}
              />
              {fieldErrors.title && (
                <span role="alert" style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>
                  {fieldErrors.title}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="modal-category"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}
              >
                카테고리 <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <select
                id="modal-category"
                value={fields.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  border: `1px solid ${fieldErrors.categoryId ? 'var(--color-danger)' : 'var(--color-border-strong)'}`,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  color: 'var(--color-text)',
                  background: 'var(--color-bg)',
                  boxSizing: 'border-box',
                }}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {fieldErrors.categoryId && (
                <span role="alert" style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>
                  {fieldErrors.categoryId}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="modal-startDate"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}
              >
                시작일
              </label>
              <input
                id="modal-startDate"
                type="date"
                value={fields.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  border: '1px solid var(--color-border-strong)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  color: 'var(--color-text)',
                  background: 'var(--color-bg)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="modal-dueDate"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}
              >
                마감일
              </label>
              <input
                id="modal-dueDate"
                type="date"
                value={fields.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  border: `1px solid ${fieldErrors.dueDate ? 'var(--color-danger)' : 'var(--color-border-strong)'}`,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  color: 'var(--color-text)',
                  background: 'var(--color-bg)',
                  boxSizing: 'border-box',
                }}
              />
              {fieldErrors.dueDate && (
                <span role="alert" style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>
                  {fieldErrors.dueDate}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="modal-description"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}
              >
                설명
              </label>
              <textarea
                id="modal-description"
                value={fields.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--color-border-strong)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  color: 'var(--color-text)',
                  background: 'var(--color-bg)',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              style={{
                height: '40px',
                padding: '0 20px',
                border: '1px solid var(--color-border-strong)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg)',
                color: 'var(--color-text-muted)',
                fontSize: '14px',
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{
                height: '40px',
                padding: '0 20px',
                background: isPending ? 'var(--color-border-strong)' : 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
