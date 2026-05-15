import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterBar } from '@/features/todos/components/FilterBar';
import type { Category } from '@/features/categories/types/category.types';

const categories: Category[] = [
  { id: 'cat1', name: '업무', isDefault: false, userId: null, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cat2', name: '개인', isDefault: false, userId: null, createdAt: '2024-01-01T00:00:00Z' },
];

describe('FilterBar', () => {
  it('카테고리 select 변경 시 onFiltersChange가 categoryId와 함께 호출된다', () => {
    const onFiltersChange = vi.fn();
    render(<FilterBar filters={{}} onFiltersChange={onFiltersChange} categories={categories} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cat1' } });

    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ categoryId: 'cat1' }));
  });

  it('완료여부 라디오 "완료" 선택 시 onFiltersChange({ isCompleted: true }) 호출', () => {
    const onFiltersChange = vi.fn();
    render(<FilterBar filters={{}} onFiltersChange={onFiltersChange} categories={categories} />);

    fireEvent.click(screen.getByRole('radio', { name: '완료' }));

    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ isCompleted: true }));
  });

  it('dueDateFrom > dueDateTo 설정 시 오류 메시지 표시 + onFiltersChange 미호출', () => {
    const onFiltersChange = vi.fn();
    render(
      <FilterBar
        filters={{ dueDateFrom: '2024-01-10', dueDateTo: '2024-01-05' }}
        onFiltersChange={onFiltersChange}
        categories={categories}
      />,
    );

    const dateInputs = screen.getAllByDisplayValue(/2024/);
    fireEvent.change(dateInputs[0]!, { target: { value: '2024-01-10' } });

    expect(screen.getByTestId('filter-range-error')).toBeInTheDocument();
    expect(onFiltersChange).not.toHaveBeenCalled();
  });

  it('필터 초기화 버튼 클릭 시 onFiltersChange({}) 호출', () => {
    const onFiltersChange = vi.fn();
    render(
      <FilterBar
        filters={{ categoryId: 'cat1', isCompleted: true }}
        onFiltersChange={onFiltersChange}
        categories={categories}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '필터 초기화' }));

    expect(onFiltersChange).toHaveBeenCalledWith({});
  });
});
