import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterBar from '@/features/todos/components/FilterBar';
import type { Category } from '@/features/categories/types/category.types';
import type { TodoListFilters } from '@/features/todos/types/todo.types';

function Controlled({
  onChange,
  initial = {},
  categories,
}: {
  onChange?: (v: TodoListFilters) => void;
  initial?: TodoListFilters;
  categories: Category[];
}) {
  const [v, setV] = useState<TodoListFilters>(initial);
  return (
    <FilterBar
      value={v}
      onChange={(next) => {
        setV(next);
        onChange?.(next);
      }}
      categories={categories}
    />
  );
}

const CATEGORIES: Category[] = [
  { id: 'cat-1', userId: null, name: '업무', isDefault: true, createdAt: 'x' },
  { id: 'cat-2', userId: null, name: '개인', isDefault: true, createdAt: 'x' },
];

describe('FilterBar', () => {
  it('카테고리 선택 시 onChange 호출', async () => {
    const onChange = vi.fn();
    render(<FilterBar value={{}} onChange={onChange} categories={CATEGORIES} />);
    await userEvent.selectOptions(screen.getByLabelText('카테고리'), 'cat-1');
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ categoryId: 'cat-1' }));
  });

  it('완료 여부 라디오 선택 시 isCompleted 변경 (controlled)', async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} categories={CATEGORIES} />);
    await userEvent.click(screen.getByLabelText('완료'));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ isCompleted: true }));
    await userEvent.click(screen.getByLabelText('미완료'));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ isCompleted: false }));
    await userEvent.click(screen.getByLabelText('전체'));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ isCompleted: undefined }));
  });

  it('from > to 일 때 onChange 차단 + 오류 메시지', async () => {
    const onChange = vi.fn();
    render(
      <FilterBar
        value={{ dueDateFrom: '2026-05-01' }}
        onChange={onChange}
        categories={CATEGORIES}
      />,
    );
    await userEvent.type(screen.getByLabelText('종료일'), '2026-04-30');
    expect(screen.getByTestId('filter-range-error')).toHaveTextContent(/시작일은 종료일 이전/);
    // 마지막 호출 인자에 dueDateTo가 반영되지 않음
    const last = onChange.mock.calls.at(-1);
    expect(last?.[0]?.dueDateTo).toBeUndefined();
  });

  it('필터 초기화 버튼: onChange({})', async () => {
    const onChange = vi.fn();
    render(
      <FilterBar
        value={{ categoryId: 'cat-1', isCompleted: true }}
        onChange={onChange}
        categories={CATEGORIES}
      />,
    );
    await userEvent.click(screen.getByTestId('filter-reset'));
    expect(onChange).toHaveBeenLastCalledWith({});
  });
});
