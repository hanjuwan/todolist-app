import { useState } from 'react';
import {
  useDeleteCategory,
  useUpdateCategory,
} from '@/features/categories/hooks/use-category-mutations';
import { CreateCategorySchema } from '@/features/categories/categories.schemas';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import type { Category } from '@/features/categories/types/category.types';

interface Props {
  category: Category;
}

const DEFAULT_DISABLED_TIP = '기본 카테고리는 변경할 수 없습니다.';

export default function CategoryRow({ category }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const update = useUpdateCategory();
  const del = useDeleteCategory();

  function startEdit() {
    setName(category.name);
    setFieldError(null);
    setServerError(null);
    setEditing(true);
  }

  function save() {
    const parsed = CreateCategorySchema.safeParse({ name: name.trim() });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? '입력값을 확인하세요.');
      return;
    }
    setFieldError(null);
    update.mutate(
      { id: category.id, body: parsed.data },
      {
        onSuccess: () => setEditing(false),
        onError: (err) => {
          if (err.status === 409 && err.code === 'CATEGORY_NAME_DUPLICATED') {
            setServerError('이미 사용 중인 카테고리명입니다.');
          } else {
            setServerError(err.message || '수정 중 오류가 발생했습니다.');
          }
        },
      },
    );
  }

  function performDelete() {
    setConfirmDelete(false);
    del.mutate(category.id, {
      onError: (err) => {
        if (err.status === 409 && err.code === 'CATEGORY_HAS_TODOS') {
          setServerError('이 카테고리에 연결된 할일이 있어 삭제할 수 없습니다.');
        } else {
          setServerError(err.message || '삭제 중 오류가 발생했습니다.');
        }
      },
    });
  }

  return (
    <li data-testid={`category-row-${category.id}`}>
      {editing ? (
        <>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label={`${category.name} 이름 수정`}
            data-testid={`category-edit-input-${category.id}`}
          />
          <button type="button" onClick={save} disabled={update.isPending}>
            저장
          </button>
          <button type="button" onClick={() => setEditing(false)}>
            취소
          </button>
        </>
      ) : (
        <>
          <span>{category.name}</span>
          {category.isDefault && <span data-testid={`category-default-badge-${category.id}`}>기본</span>}
          <button
            type="button"
            onClick={startEdit}
            disabled={category.isDefault}
            title={category.isDefault ? DEFAULT_DISABLED_TIP : undefined}
            data-testid={`category-edit-btn-${category.id}`}
          >
            수정
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={category.isDefault || del.isPending}
            title={category.isDefault ? DEFAULT_DISABLED_TIP : undefined}
            data-testid={`category-delete-btn-${category.id}`}
          >
            삭제
          </button>
        </>
      )}
      {fieldError && (
        <p role="alert" data-testid={`category-field-error-${category.id}`}>
          {fieldError}
        </p>
      )}
      {serverError && (
        <p role="alert" data-testid={`category-server-error-${category.id}`}>
          {serverError}
        </p>
      )}
      <ConfirmDialog
        open={confirmDelete}
        title="카테고리를 삭제하시겠습니까?"
        description={`"${category.name}" 카테고리를 삭제합니다.`}
        confirmLabel="삭제"
        destructive
        onConfirm={performDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </li>
  );
}
