import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { TodoModal } from '@/features/todos/components/TodoModal';
import type { Todo } from '@/features/todos/types/todo.types';
import type { Category } from '@/features/categories/types/category.types';

const mockOnClose = vi.fn();

const mockCategories: Category[] = [
  { id: '11111111-1111-4111-8111-111111111111', name: '업무', isDefault: true, userId: null, createdAt: '2024-01-01' },
];

const mockTodo: Todo = {
  id: 'todo1',
  userId: 'u1',
  categoryId: '11111111-1111-4111-8111-111111111111',
  title: '기존 제목',
  description: '기존 설명',
  startDate: '2026-05-15',
  dueDate: '2026-05-20',
  isCompleted: false,
  completedAt: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const mock = new MockAdapter(apiClient);

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderModal(todo?: Todo) {
  return render(
    <QueryClientProvider client={makeClient()}>
      <TodoModal todo={todo} categories={mockCategories} onClose={mockOnClose} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mockOnClose.mockClear();
});

afterEach(() => {
  mock.reset();
});

describe('TodoModal', () => {
  it('등록 모드: "새 할일 추가" 헤더와 빈 title 필드가 표시된다', () => {
    renderModal();
    expect(screen.getByText('새 할일 추가')).toBeInTheDocument();
    expect(screen.getByLabelText(/제목/)).toHaveValue('');
  });

  it('수정 모드: "할일 수정" 헤더와 todo.title이 프리필된다', () => {
    renderModal(mockTodo);
    expect(screen.getByText('할일 수정')).toBeInTheDocument();
    expect(screen.getByLabelText(/제목/)).toHaveValue('기존 제목');
  });

  it('빈 title로 submit 시 "제목은 필수 항목입니다." 오류가 표시된다', async () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(await screen.findByText('제목은 필수 항목입니다.')).toBeInTheDocument();
  });

  it('등록 성공: 올바른 데이터 입력 → POST /todos → 201 → onClose 호출', async () => {
    mock.onPost('/todos').reply(201, {
      success: true,
      data: { ...mockTodo, id: 'new1', title: '새 할일' },
    });

    renderModal();
    fireEvent.change(screen.getByLabelText(/제목/), { target: { value: '새 할일' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('수정 성공: 데이터 수정 → PATCH /todos/todo1 → 200 → onClose 호출', async () => {
    mock.onPatch('/todos/todo1').reply(200, {
      success: true,
      data: { ...mockTodo, title: '수정된 제목' },
    });

    renderModal(mockTodo);
    fireEvent.change(screen.getByLabelText(/제목/), { target: { value: '수정된 제목' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('서버 오류: POST 500 → 오류 메시지 표시 및 onClose 미호출', async () => {
    mock.onPost('/todos').reply(500, { error: { code: 'SERVER_ERROR', message: '서버 오류' } });

    renderModal();
    fireEvent.change(screen.getByLabelText(/제목/), { target: { value: '새 할일' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('취소 버튼 클릭 → onClose 호출 (API 미호출)', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(mockOnClose).toHaveBeenCalled();
    expect(mock.history['post']).toHaveLength(0);
  });

  it('Esc 키 → onClose 호출', () => {
    renderModal();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('등록 모드: 시작일 input이 존재한다', () => {
    renderModal();
    expect(screen.getByLabelText(/시작일/)).toBeInTheDocument();
  });

  it('수정 모드: todo.startDate가 시작일 input에 프리필된다', () => {
    renderModal(mockTodo);
    expect(screen.getByLabelText(/시작일/)).toHaveValue('2026-05-15');
  });
});
