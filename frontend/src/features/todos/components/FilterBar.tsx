import { useState, useEffect } from 'react';
import type { TodoListFilters } from '@/features/todos/types/todo.types';
import type { Category } from '@/features/categories/types/category.types';

interface FilterBarProps {
  filters: TodoListFilters;
  onFiltersChange: (filters: TodoListFilters) => void;
  categories: Category[];
}

export function FilterBar({ filters, onFiltersChange, categories }: FilterBarProps) {
  const initialFrom = filters.dueDateFrom ?? '';
  const initialTo = filters.dueDateTo ?? '';

  const [dueDateFrom, setDueDateFrom] = useState(initialFrom);
  const [dueDateTo, setDueDateTo] = useState(initialTo);
  const [dateRangeError, setDateRangeError] = useState(
    !!(initialFrom && initialTo && initialFrom > initialTo),
  );

  useEffect(() => {
    const from = filters.dueDateFrom ?? '';
    const to = filters.dueDateTo ?? '';
    setDueDateFrom(from);
    setDueDateTo(to);
    setDateRangeError(!!(from && to && from > to));
  }, [filters.dueDateFrom, filters.dueDateTo]);

  function handleDateChange(from: string, to: string) {
    if (from && to && from > to) {
      setDateRangeError(true);
      return;
    }
    setDateRangeError(false);
    onFiltersChange({
      ...filters,
      dueDateFrom: from || undefined,
      dueDateTo: to || undefined,
    });
  }

  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        boxShadow: 'var(--shadow-sm)',
        background: 'var(--color-surface)',
        position: 'relative',
      }}
    >
      <button
        type="button"
        onClick={() => onFiltersChange({})}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          height: '32px',
          padding: '0 12px',
          border: '1px solid var(--color-border-strong)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-bg)',
          color: 'var(--color-text-muted)',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        필터 초기화
      </button>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', paddingRight: '100px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>카테고리</label>
          <select
            value={filters.categoryId ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              onFiltersChange({ ...filters, categoryId: val || undefined });
            }}
            style={{
              height: '36px',
              padding: '0 8px',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              color: 'var(--color-text)',
              background: 'var(--color-bg)',
              cursor: 'pointer',
            }}
          >
            <option value="">전체</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>완료 여부</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', height: '36px' }}>
            {(
              [
                { label: '전체', value: undefined },
                { label: '완료', value: true },
                { label: '미완료', value: false },
              ] as { label: string; value: boolean | undefined }[]
            ).map(({ label, value }) => (
              <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="radio"
                  name="isCompleted"
                  checked={filters.isCompleted === value}
                  onChange={() => onFiltersChange({ ...filters, isCompleted: value })}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>종료예정일</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="date"
              value={dueDateFrom}
              onChange={(e) => {
                const val = e.target.value;
                setDueDateFrom(val);
                handleDateChange(val, dueDateTo);
              }}
              style={{
                height: '36px',
                padding: '0 8px',
                border: '1px solid var(--color-border-strong)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                color: 'var(--color-text)',
              }}
            />
            <span style={{ color: 'var(--color-text-muted)' }}>~</span>
            <input
              type="date"
              value={dueDateTo}
              onChange={(e) => {
                const val = e.target.value;
                setDueDateTo(val);
                handleDateChange(dueDateFrom, val);
              }}
              style={{
                height: '36px',
                padding: '0 8px',
                border: '1px solid var(--color-border-strong)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                color: 'var(--color-text)',
              }}
            />
          </div>
          {dateRangeError && (
            <span
              data-testid="filter-range-error"
              style={{ fontSize: '12px', color: 'var(--color-danger)' }}
            >
              시작일이 종료일보다 클 수 없습니다.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
