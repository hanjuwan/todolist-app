import { AppHeader } from '@/shared/components/AppHeader';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { CategoryRow } from '@/features/categories/components/CategoryRow';
import { CategoryForm } from '@/features/categories/components/CategoryForm';

export default function CategoriesPage() {
  const { data: categories, isLoading, isError } = useCategories();

  const defaultCategories = categories?.filter((c) => c.isDefault) ?? [];
  const userCategories = categories?.filter((c) => !c.isDefault) ?? [];

  return (
    <div
      data-testid="categories-page"
      style={{ minHeight: '100vh', background: 'var(--color-surface)' }}
    >
      <AppHeader />
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '24px 16px',
        }}
      >
        {isLoading && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>로딩 중...</p>
        )}
        {isError && (
          <p style={{ color: 'var(--color-danger)', fontSize: '14px' }}>오류가 발생했습니다.</p>
        )}
        {!isLoading && !isError && (
          <>
            <section
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '20px',
              }}
            >
              <h2
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  margin: '0 0 12px',
                }}
              >
                기본 카테고리
              </h2>
              {defaultCategories.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))}
            </section>

            <section
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h2
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  margin: '0 0 12px',
                }}
              >
                내 카테고리
              </h2>
              {userCategories.length === 0 && (
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-text-muted)',
                    margin: '0 0 12px',
                  }}
                >
                  아직 추가한 카테고리가 없습니다.
                </p>
              )}
              {userCategories.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))}
              <div style={{ marginTop: '16px' }}>
                <CategoryForm />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
