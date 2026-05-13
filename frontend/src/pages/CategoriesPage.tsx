import AppHeader from '@/shared/components/AppHeader';
import CategoryForm from '@/features/categories/components/CategoryForm';
import CategoryRow from '@/features/categories/components/CategoryRow';
import { useCategories } from '@/features/categories/hooks/use-categories';

export default function CategoriesPage() {
  const { data, isLoading, isError, error } = useCategories();
  const categories = data ?? [];
  const defaults = categories.filter((c) => c.isDefault);
  const custom = categories.filter((c) => !c.isDefault);

  return (
    <div data-testid="page-categories">
      <AppHeader />
      <h1>카테고리 관리</h1>

      <CategoryForm />

      {isLoading && <p data-testid="categories-loading">불러오는 중...</p>}
      {isError && (
        <p role="alert" data-testid="categories-error">
          {error?.message || '카테고리를 불러올 수 없습니다.'}
        </p>
      )}

      <section aria-label="기본 카테고리">
        <h2>기본 카테고리</h2>
        <ul data-testid="default-categories-list">
          {defaults.map((c) => (
            <CategoryRow key={c.id} category={c} />
          ))}
        </ul>
      </section>

      <section aria-label="사용자 카테고리">
        <h2>내 카테고리</h2>
        {custom.length === 0 && !isLoading ? (
          <p data-testid="custom-empty">아직 추가한 카테고리가 없습니다.</p>
        ) : (
          <ul data-testid="custom-categories-list">
            {custom.map((c) => (
              <CategoryRow key={c.id} category={c} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
