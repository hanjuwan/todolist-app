import { useState, type FormEvent } from 'react';
import { CreateCategorySchema } from '@/features/categories/categories.schemas';
import { useCreateCategory } from '@/features/categories/hooks/use-category-mutations';

export default function CategoryForm() {
  const [name, setName] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const { mutate, isPending } = useCreateCategory();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    const parsed = CreateCategorySchema.safeParse({ name: name.trim() });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? '입력값을 확인하세요.');
      return;
    }
    setFieldError(null);
    mutate(parsed.data, {
      onSuccess: () => {
        setName('');
      },
      onError: (err) => {
        if (err.status === 409 && err.code === 'CATEGORY_NAME_DUPLICATED') {
          setServerError('이미 사용 중인 카테고리명입니다.');
        } else {
          setServerError(err.message || '카테고리 추가 중 오류가 발생했습니다.');
        }
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} aria-label="카테고리 추가 폼" noValidate>
      <label htmlFor="category-name">새 카테고리</label>
      <input
        id="category-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-invalid={!!fieldError}
        data-testid="category-name-input"
      />
      <button type="submit" disabled={isPending} data-testid="category-add-btn">
        {isPending ? '추가 중...' : '추가'}
      </button>
      {fieldError && (
        <p role="alert" data-testid="category-field-error">
          {fieldError}
        </p>
      )}
      {serverError && (
        <p role="alert" data-testid="category-server-error">
          {serverError}
        </p>
      )}
    </form>
  );
}
