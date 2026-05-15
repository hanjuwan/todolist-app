import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DayTodosDialog } from '@/features/todos/components/DayTodosDialog';
import type { Todo } from '@/features/todos/types/todo.types';
import type { Category } from '@/features/categories/types/category.types';

const mockOnClose = vi.fn();
const mockOnEditTodo = vi.fn();

const categories: Category[] = [
  { id: 'cat1', name: '업무', isDefault: true, userId: null, createdAt: '2024-01-01T00:00:00Z' },
];

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'todo1',
    userId: 'u1',
    categoryId: 'cat1',
    title: '테스트 할일',
    description: null,
    startDate: null,
    dueDate: '2026-05-20',
    isCompleted: false,
    completedAt: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

beforeEach(() => {
  mockOnClose.mockClear();
  mockOnEditTodo.mockClear();
});

describe('DayTodosDialog', () => {
  it('다이얼로그가 렌더링되고 날짜 헤더가 한국어 형식으로 표시된다', () => {
    render(
      <DayTodosDialog
        date="2026-05-20"
        todos={[]}
        categories={categories}
        onClose={mockOnClose}
        onEditTodo={mockOnEditTodo}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('2026년 5월 20일')).toBeInTheDocument();
  });

  it('todos 목록이 있을 때 제목과 카테고리명이 표시된다', () => {
    const todos = [
      makeTodo({ id: 'todo1', title: '할일 첫번째', categoryId: 'cat1' }),
      makeTodo({ id: 'todo2', title: '할일 두번째', categoryId: 'cat1' }),
    ];

    render(
      <DayTodosDialog
        date="2026-05-20"
        todos={todos}
        categories={categories}
        onClose={mockOnClose}
        onEditTodo={mockOnEditTodo}
      />,
    );

    expect(screen.getByText('할일 첫번째')).toBeInTheDocument();
    expect(screen.getByText('할일 두번째')).toBeInTheDocument();
    expect(screen.getAllByText(/업무/)).toHaveLength(2);
  });

  it('todos가 빈 배열일 때 "이 날짜에 등록된 할일이 없습니다." 메시지가 표시된다', () => {
    render(
      <DayTodosDialog
        date="2026-05-20"
        todos={[]}
        categories={categories}
        onClose={mockOnClose}
        onEditTodo={mockOnEditTodo}
      />,
    );

    expect(screen.getByText('이 날짜에 등록된 할일이 없습니다.')).toBeInTheDocument();
  });

  it('"수정" 버튼 클릭 시 onEditTodo가 해당 todo를 인자로 호출된다', () => {
    const todo = makeTodo({ id: 'todo1', title: '수정할 할일' });

    render(
      <DayTodosDialog
        date="2026-05-20"
        todos={[todo]}
        categories={categories}
        onClose={mockOnClose}
        onEditTodo={mockOnEditTodo}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '수정' }));

    expect(mockOnEditTodo).toHaveBeenCalledWith(todo);
  });

  it('Esc 키 입력 시 onClose가 호출된다', () => {
    render(
      <DayTodosDialog
        date="2026-05-20"
        todos={[]}
        categories={categories}
        onClose={mockOnClose}
        onEditTodo={mockOnEditTodo}
      />,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('푸터 "닫기" 버튼 클릭 시 onClose가 호출된다', () => {
    render(
      <DayTodosDialog
        date="2026-05-20"
        todos={[]}
        categories={categories}
        onClose={mockOnClose}
        onEditTodo={mockOnEditTodo}
      />,
    );

    fireEvent.click(screen.getByText('닫기'));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('startDate와 dueDate 모두 있을 때 "기간: ..." 형식으로 표시된다', () => {
    const todo = makeTodo({ startDate: '2026-05-15', dueDate: '2026-05-20' });

    render(
      <DayTodosDialog
        date="2026-05-20"
        todos={[todo]}
        categories={categories}
        onClose={mockOnClose}
        onEditTodo={mockOnEditTodo}
      />,
    );

    expect(screen.getByText('기간: 2026-05-15 ~ 2026-05-20')).toBeInTheDocument();
  });

  it('dueDate만 있을 때 "마감: ..." 형식으로 표시된다', () => {
    const todo = makeTodo({ startDate: null, dueDate: '2026-05-20' });

    render(
      <DayTodosDialog
        date="2026-05-20"
        todos={[todo]}
        categories={categories}
        onClose={mockOnClose}
        onEditTodo={mockOnEditTodo}
      />,
    );

    expect(screen.getByText('마감: 2026-05-20')).toBeInTheDocument();
  });
});
