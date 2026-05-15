import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TodoCalendar } from '@/features/todos/components/TodoCalendar';
import type { Todo } from '@/features/todos/types/todo.types';

const mockOnSelectDate = vi.fn();

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'todo1',
    userId: 'u1',
    categoryId: 'cat1',
    title: '테스트 할일',
    description: null,
    startDate: null,
    dueDate: null,
    isCompleted: false,
    completedAt: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('TodoCalendar', () => {
  it('data-testid="todo-calendar"이 존재하고 요일 헤더 7개가 렌더링된다', () => {
    render(<TodoCalendar todos={[]} onSelectDate={mockOnSelectDate} />);

    expect(screen.getByTestId('todo-calendar')).toBeInTheDocument();

    const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
    for (const label of dayLabels) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('헤더에 현재 연월이 "{year}년 {month}월" 형식으로 표시된다', () => {
    render(<TodoCalendar todos={[]} onSelectDate={mockOnSelectDate} />);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    expect(screen.getByTestId('calendar-month-label')).toHaveTextContent(`${year}년 ${month}월`);
  });

  it('다음 달 버튼 클릭 시 월이 증가하고, 이전 달 버튼 클릭 시 원래 월로 돌아온다', () => {
    render(<TodoCalendar todos={[]} onSelectDate={mockOnSelectDate} />);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    fireEvent.click(screen.getByRole('button', { name: '다음 달' }));
    expect(screen.getByTestId('calendar-month-label')).toHaveTextContent(`${nextYear}년 ${nextMonth}월`);

    fireEvent.click(screen.getByRole('button', { name: '이전 달' }));
    expect(screen.getByTestId('calendar-month-label')).toHaveTextContent(`${year}년 ${month}월`);
  });

  it('todo의 dueDate에 해당하는 셀에 제목이 칩으로 표시된다 (3개째부터 "+N개 더보기")', () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-15`;

    const todos = [
      makeTodo({ id: 't1', title: '회의 준비', dueDate: dateStr }),
      makeTodo({ id: 't2', title: '보고서 제출', dueDate: dateStr }),
      makeTodo({ id: 't3', title: '코드 리뷰', dueDate: dateStr }),
    ];

    render(<TodoCalendar todos={todos} onSelectDate={mockOnSelectDate} />);

    expect(screen.getByTestId(`calendar-todo-t1-${dateStr}`)).toHaveTextContent('회의 준비');
    expect(screen.getByTestId(`calendar-todo-t2-${dateStr}`)).toHaveTextContent('보고서 제출');
    expect(screen.queryByTestId(`calendar-todo-t3-${dateStr}`)).not.toBeInTheDocument();
    expect(screen.getByText('+1개 더보기')).toBeInTheDocument();
  });

  it('완료된 todo는 칩에 취소선 스타일이 적용된다', () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-10`;

    const todos = [makeTodo({ id: 't1', title: '완료된 일', dueDate: dateStr, isCompleted: true })];

    render(<TodoCalendar todos={todos} onSelectDate={mockOnSelectDate} />);

    const chip = screen.getByTestId(`calendar-todo-t1-${dateStr}`);
    expect(chip).toHaveStyle({ textDecoration: 'line-through' });
  });

  it('startDate~dueDate 기간이 있는 todo가 범위 내 여러 셀에 표시된다', () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const startDate = `${year}-${month}-10`;
    const midDate = `${year}-${month}-11`;
    const endDate = `${year}-${month}-12`;

    const todos = [makeTodo({ id: 'tp1', title: '기간 할일', startDate, dueDate: endDate })];

    render(<TodoCalendar todos={todos} onSelectDate={mockOnSelectDate} />);

    expect(screen.getByTestId(`calendar-todo-tp1-${startDate}`)).toBeInTheDocument();
    expect(screen.getByTestId(`calendar-todo-tp1-${midDate}`)).toBeInTheDocument();
    expect(screen.getByTestId(`calendar-todo-tp1-${endDate}`)).toBeInTheDocument();
  });

  it('날짜 셀 클릭 시 onSelectDate가 YYYY-MM-DD 형식으로 호출된다', () => {
    mockOnSelectDate.mockClear();

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;

    render(<TodoCalendar todos={[]} onSelectDate={mockOnSelectDate} />);

    const cellButton = screen.getByRole('button', { name: `${dateStr} 날짜 선택` });
    fireEvent.click(cellButton);

    expect(mockOnSelectDate).toHaveBeenCalledWith(dateStr);
  });

  it('오늘 날짜 셀에 aria-current="date" 속성이 있다', () => {
    render(<TodoCalendar todos={[]} onSelectDate={mockOnSelectDate} />);

    const todayCell = screen.getByRole('button', { current: 'date' });
    expect(todayCell).toBeInTheDocument();
  });
});
