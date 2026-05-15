import { useState } from 'react';
import { useCreateCategory } from '@/features/categories/hooks/use-category-mutations';
import { ApiError } from '@/shared/types';

export function CategoryForm() {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createCategory = useCreateCategory();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    createCategory.mutate(name.trim(), {
      onSuccess: () => {
        setName('');
      },
      onError: (err) => {
        if (err instanceof ApiError && err.code === 'CATEGORY_NAME_DUPLICATED') {
          setError('이미 사용 중인 카테고리 이름입니다.');
        } else {
          setError('추가 중 오류가 발생했습니다.');
        }
      },
    });
  }

  const isDisabled = !name.trim() || createCategory.isPending;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          placeholder="새 카테고리 이름"
          maxLength={50}
          style={{
            flex: 1,
            height: '38px',
            padding: '0 12px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            color: 'var(--color-text)',
            background: 'var(--color-bg)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={isDisabled}
          style={{
            height: '38px',
            padding: '0 16px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: isDisabled ? 'var(--color-primary)' : 'var(--color-primary)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            opacity: isDisabled ? 0.5 : 1,
          }}
        >
          추가
        </button>
      </div>
      {error && (
        <span style={{ color: 'var(--color-danger)', fontSize: '12px' }}>{error}</span>
      )}
    </form>
  );
}
