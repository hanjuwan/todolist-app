import { useState } from 'react';
import { today } from '@/shared/utils/date';
import { getCategoryColor } from '@/shared/utils/category-color';
import type { Todo } from '@/features/todos/types/todo.types';

interface TodoCalendarProps {
  todos: Todo[];
  onSelectDate: (date: string) => void;
}

interface CalendarCell {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

function buildCalendarCells(year: number, month: number, todayStr: string): CalendarCell[] {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();

  const cells: CalendarCell[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ date: dateStr, day: d, isCurrentMonth: false, isToday: dateStr === todayStr });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ date: dateStr, day: d, isCurrentMonth: true, isToday: dateStr === todayStr });
  }

  const remaining = 42 - cells.length;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  for (let d = 1; d <= remaining; d++) {
    const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ date: dateStr, day: d, isCurrentMonth: false, isToday: dateStr === todayStr });
  }

  return cells;
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function isInRange(todo: Todo, date: string): boolean {
  const s = todo.startDate;
  const d = todo.dueDate;
  if (s && d) return s <= date && date <= d;
  if (s) return s === date;
  if (d) return d === date;
  return false;
}

function getCellPosition(todo: Todo, date: string): 'single' | 'start' | 'middle' | 'end' {
  if (!todo.startDate || !todo.dueDate || todo.startDate === todo.dueDate) return 'single';
  if (todo.startDate === date) return 'start';
  if (todo.dueDate === date) return 'end';
  return 'middle';
}

export function TodoCalendar({ todos, onSelectDate }: TodoCalendarProps) {
  const todayStr = today();
  const todayDate = new Date(todayStr);
  const [viewMonth, setViewMonth] = useState({ year: todayDate.getFullYear(), month: todayDate.getMonth() + 1 });

  const cells = buildCalendarCells(viewMonth.year, viewMonth.month, todayStr);

  const MAX_VISIBLE = 2;

  function goPrev() {
    setViewMonth((prev) => {
      if (prev.month === 1) return { year: prev.year - 1, month: 12 };
      return { year: prev.year, month: prev.month - 1 };
    });
  }

  function goNext() {
    setViewMonth((prev) => {
      if (prev.month === 12) return { year: prev.year + 1, month: 1 };
      return { year: prev.year, month: prev.month + 1 };
    });
  }

  return (
    <div
      data-testid="todo-calendar"
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <button
          type="button"
          onClick={goPrev}
          aria-label="이전 달"
          style={{
            width: '32px',
            height: '32px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg)',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'var(--color-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ◀
        </button>
        <span
          data-testid="calendar-month-label"
          style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text)' }}
        >
          {viewMonth.year}년 {viewMonth.month}월
        </span>
        <button
          type="button"
          onClick={goNext}
          aria-label="다음 달"
          style={{
            width: '32px',
            height: '32px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg)',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'var(--color-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ▶
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
          marginBottom: '4px',
        }}
      >
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            style={{
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              padding: '4px 0',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
        }}
      >
        {cells.map((cell) => {
          const cellTodos = todos.filter((t) => isInRange(t, cell.date));
          const visible = cellTodos.slice(0, MAX_VISIBLE);
          const hidden = cellTodos.length - visible.length;
          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => onSelectDate(cell.date)}
              aria-label={`${cell.date} 날짜 선택`}
              aria-current={cell.isToday ? 'date' : undefined}
              style={{
                minHeight: '88px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: '2px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                background: cell.isToday ? 'var(--color-accent-soft-bg)' : 'var(--color-bg)',
                color: cell.isCurrentMonth ? 'var(--color-text)' : 'var(--color-text-disabled)',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '4px',
                textAlign: 'left',
                overflow: 'hidden',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: cell.isToday ? 700 : 500, paddingLeft: '2px' }}>
                {cell.day}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                {visible.map((todo) => {
                  const color = getCategoryColor(todo.categoryId);
                  const position = getCellPosition(todo, cell.date);
                  const borderRadius =
                    position === 'single' ? 'var(--radius-sm)' :
                    position === 'start' ? 'var(--radius-sm) 0 0 var(--radius-sm)' :
                    position === 'end' ? '0 var(--radius-sm) var(--radius-sm) 0' :
                    '0';
                  const borderLeft = (position === 'single' || position === 'start') ? `3px solid ${color.dot}` : 'none';
                  const marginLeft = (position === 'middle' || position === 'end') ? '-4px' : undefined;
                  const marginRight = (position === 'start' || position === 'middle') ? '-4px' : undefined;
                  return (
                    <span
                      key={todo.id}
                      data-testid={`calendar-todo-${todo.id}-${cell.date}`}
                      title={todo.title}
                      style={{
                        background: color.bg,
                        color: color.text,
                        borderLeft,
                        borderRadius,
                        marginLeft,
                        marginRight,
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '1px 5px',
                        lineHeight: '14px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textDecoration: todo.isCompleted ? 'line-through' : 'none',
                        opacity: todo.isCompleted ? 0.6 : 1,
                      }}
                    >
                      {todo.title}
                    </span>
                  );
                })}
                {hidden > 0 && (
                  <span
                    style={{
                      fontSize: '10px',
                      color: 'var(--color-text-muted)',
                      paddingLeft: '5px',
                    }}
                  >
                    +{hidden}개 더보기
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
