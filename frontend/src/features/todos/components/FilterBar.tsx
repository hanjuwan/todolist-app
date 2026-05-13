import { useState } from 'react';
import type { TodoListFilters } from '@/features/todos/types/todo.types';
import type { Category } from '@/features/categories/types/category.types';

interface Props {
  value: TodoListFilters;
  onChange: (next: TodoListFilters) => void;
  categories: Category[];
}

type CompletedMode = 'all' | 'completed' | 'incomplete';

function toCompletedMode(v: boolean | undefined): CompletedMode {
  if (v === undefined) return 'all';
  return v ? 'completed' : 'incomplete';
}

function fromCompletedMode(m: CompletedMode): boolean | undefined {
  if (m === 'all') return undefined;
  return m === 'completed';
}

export default function FilterBar({ value, onChange, categories }: Props) {
  const [rangeError, setRangeError] = useState<string | null>(null);
  const completedMode = toCompletedMode(value.isCompleted);

  function update(patch: Partial<TodoListFilters>) {
    const next = { ...value, ...patch };
    if (next.dueDateFrom && next.dueDateTo && next.dueDateFrom > next.dueDateTo) {
      setRangeError('시작일은 종료일 이전이어야 합니다.');
      return;
    }
    setRangeError(null);
    onChange(next);
  }

  function reset() {
    setRangeError(null);
    onChange({});
  }

  return (
    <section aria-label="필터" data-testid="filter-bar">
      <div>
        <h2>필터</h2>
        <button type="button" onClick={reset} data-testid="filter-reset">
          필터 초기화
        </button>
      </div>

      <div>
        <label htmlFor="filter-category">카테고리</label>
        <select
          id="filter-category"
          value={value.categoryId ?? ''}
          onChange={(e) => update({ categoryId: e.target.value || undefined })}
        >
          <option value="">전체</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend>완료 여부</legend>
        {(['all', 'completed', 'incomplete'] as const).map((m) => (
          <label key={m}>
            <input
              type="radio"
              name="completed-mode"
              value={m}
              checked={completedMode === m}
              onChange={() => update({ isCompleted: fromCompletedMode(m) })}
            />
            {m === 'all' ? '전체' : m === 'completed' ? '완료' : '미완료'}
          </label>
        ))}
      </fieldset>

      <div>
        <label htmlFor="filter-from">시작일</label>
        <input
          id="filter-from"
          type="date"
          value={value.dueDateFrom ?? ''}
          onChange={(e) => update({ dueDateFrom: e.target.value || undefined })}
        />
        <label htmlFor="filter-to">종료일</label>
        <input
          id="filter-to"
          type="date"
          value={value.dueDateTo ?? ''}
          onChange={(e) => update({ dueDateTo: e.target.value || undefined })}
        />
        {rangeError && (
          <p role="alert" data-testid="filter-range-error">
            {rangeError}
          </p>
        )}
      </div>
    </section>
  );
}
