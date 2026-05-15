import { useState } from 'react';
import type { Category } from '@/features/categories/types/category.types';
import { useUpdateCategory, useDeleteCategory } from '@/features/categories/hooks/use-category-mutations';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { ApiError } from '@/shared/types';
import { getCategoryColor } from '@/shared/utils/category-color';

interface CategoryRowProps {
  category: Category;
}

export function CategoryRow({ category }: CategoryRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editError, setEditError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  function handleEditStart() {
    setEditName(category.name);
    setEditError(null);
    setIsEditing(true);
  }

  function handleEditCancel() {
    setIsEditing(false);
    setEditError(null);
  }

  function handleSave() {
    if (!editName.trim()) return;
    setEditError(null);
    updateCategory.mutate(
      { id: category.id, name: editName.trim() },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
        onError: (err) => {
          if (err instanceof ApiError && err.code === 'CATEGORY_NAME_DUPLICATED') {
            setEditError('이미 사용 중인 카테고리 이름입니다.');
          } else {
            setEditError('수정 중 오류가 발생했습니다.');
          }
        },
      },
    );
  }

  function handleDeleteConfirm() {
    setDeleteError(null);
    deleteCategory.mutate(category.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
      },
      onError: (err) => {
        if (err instanceof ApiError && err.code === 'CATEGORY_HAS_TODOS') {
          setDeleteError('이 카테고리에 연결된 할일이 있어 삭제할 수 없습니다.');
        } else {
          setDeleteError('삭제 중 오류가 발생했습니다.');
        }
      },
    });
  }

  const disabledTitle = '기본 카테고리는 변경할 수 없습니다';
  const color = getCategoryColor(category.id);

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 0',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {isEditing ? (
          <>
            <input
              type="text"
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value);
                setEditError(null);
              }}
              maxLength={50}
              style={{
                flex: 1,
                height: '34px',
                padding: '0 10px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                color: 'var(--color-text)',
                background: 'var(--color-bg)',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={!editName.trim() || updateCategory.isPending}
              style={{
                height: '32px',
                padding: '0 12px',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary)',
                color: 'white',
                fontSize: '13px',
                fontWeight: 600,
                cursor: !editName.trim() || updateCategory.isPending ? 'not-allowed' : 'pointer',
                opacity: !editName.trim() || updateCategory.isPending ? 0.5 : 1,
              }}
            >
              저장
            </button>
            <button
              type="button"
              onClick={handleEditCancel}
              style={{
                height: '32px',
                padding: '0 12px',
                border: '1px solid var(--color-border-strong)',
                borderRadius: 'var(--radius-md)',
                background: 'white',
                color: 'var(--color-text-muted)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              취소
            </button>
          </>
        ) : (
          <>
            <span
              data-testid="category-color-dot"
              aria-hidden="true"
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: color.dot,
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1, fontSize: '14px', color: 'var(--color-text)' }}>
              {category.name}
            </span>
            {category.isDefault && (
              <span
                style={{
                  background: '#F1F5F9',
                  color: 'var(--color-text-muted)',
                  borderRadius: '999px',
                  padding: '2px 10px',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              >
                기본
              </span>
            )}
            <button
              type="button"
              onClick={category.isDefault ? undefined : handleEditStart}
              disabled={category.isDefault}
              title={category.isDefault ? disabledTitle : undefined}
              style={{
                height: '32px',
                padding: '0 12px',
                border: '1px solid var(--color-border-strong)',
                borderRadius: 'var(--radius-md)',
                background: 'white',
                color: 'var(--color-text-muted)',
                fontSize: '13px',
                cursor: category.isDefault ? 'not-allowed' : 'pointer',
                opacity: category.isDefault ? 0.5 : 1,
              }}
            >
              수정
            </button>
            <button
              type="button"
              onClick={category.isDefault ? undefined : () => setShowDeleteDialog(true)}
              disabled={category.isDefault}
              title={category.isDefault ? disabledTitle : undefined}
              style={{
                height: '32px',
                padding: '0 12px',
                border: '1px solid var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                background: 'white',
                color: 'var(--color-danger)',
                fontSize: '13px',
                cursor: category.isDefault ? 'not-allowed' : 'pointer',
                opacity: category.isDefault ? 0.5 : 1,
              }}
            >
              삭제
            </button>
          </>
        )}
      </div>
      {isEditing && editError && (
        <span style={{ color: 'var(--color-danger)', fontSize: '12px' }}>{editError}</span>
      )}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="카테고리 삭제"
        message={
          deleteError
            ? deleteError
            : `"${category.name}" 카테고리를 삭제하시겠습니까?`
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false);
          setDeleteError(null);
        }}
        confirmLabel="확인"
        isLoading={deleteCategory.isPending}
      />
    </>
  );
}
