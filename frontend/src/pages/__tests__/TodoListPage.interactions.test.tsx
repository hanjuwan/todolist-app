import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/store/auth-store';
import TodoListPage from '@/pages/TodoListPage';
import type { Todo } from '@/features/todos/types/todo.types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockTodo: Todo = {
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
};

const mockPagination = { page: 1, limit: 20, total: 1, totalPages: 1 };

const mock = new MockAdapter(apiClient);

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderPage() {
  const client = makeClient();
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <TodoListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  useAuthStore.setState({
    token: 'test-token',
    user: { id: '1', email: 'a@b.com', name: '테스트' },
    isAuthenticated: true,
  });
  mock.onGet('/categories').reply(200, {
    success: true,
    data: [{ id: 'cat1', name: '업무', isDefault: true, userId: null, createdAt: '2024-01-01T00:00:00Z' }],
  });
  mockNavigate.mockClear();
});

afterEach(() => {
  mock.reset();
});

describe('TodoListPage interactions', () => {
  it('"새 할일 추가" 버튼 클릭 → 모달("새 할일 추가")이 화면에 나타난다', async () => {
    mock.onGet('/todos').reply(200, {
      success: true,
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    renderPage();
    await screen.findByText('첫 번째 할일을 등록해 보세요!');

    fireEvent.click(screen.getByRole('button', { name: '새 할일 추가' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('새 할일 추가')).toBeInTheDocument();
  });

  it('수정 버튼 클릭 → 모달("할일 수정")이 todo 데이터로 열린다', async () => {
    mock.onGet('/todos').reply(200, {
      success: true,
      data: [mockTodo],
      pagination: mockPagination,
    });

    renderPage();
    await screen.findByText(mockTodo.title);

    fireEvent.click(screen.getByRole('button', { name: '수정' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('할일 수정')).toBeInTheDocument();
    expect(screen.getByLabelText(/제목/)).toHaveValue(mockTodo.title);
  });

  it('완료 토글 클릭 → PATCH /todos/todo1/complete 호출됨', async () => {
    mock.onGet('/todos').reply(200, {
      success: true,
      data: [mockTodo],
      pagination: mockPagination,
    });
    mock.onPatch(`/todos/${mockTodo.id}/complete`).reply(200, {
      success: true,
      data: { ...mockTodo, isCompleted: true },
    });

    renderPage();
    await screen.findByText(mockTodo.title);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      const history = mock.history['patch'] ?? [];
      expect(history.some((r) => r.url === `/todos/${mockTodo.id}/complete`)).toBe(true);
    });
  });

  it('완료 토글 서버 오류 → UI 롤백 (isCompleted가 false로 복원)', async () => {
    mock.onGet('/todos').reply(200, {
      success: true,
      data: [mockTodo],
      pagination: mockPagination,
    });
    mock.onPatch(`/todos/${mockTodo.id}/complete`).reply(500, { error: { code: 'SERVER_ERROR' } });

    renderPage();
    const checkbox = await screen.findByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    }, { timeout: 3000 });
  });

  it('삭제 버튼 클릭 → 확인 다이얼로그 표시 → 확인 → DELETE /todos/todo1 호출', async () => {
    mock.onGet('/todos').reply(200, {
      success: true,
      data: [mockTodo],
      pagination: mockPagination,
    });
    mock.onDelete(`/todos/${mockTodo.id}`).reply(204);

    renderPage();
    await screen.findByText(mockTodo.title);

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: '확인' }));

    await waitFor(() => {
      const history = mock.history['delete'] ?? [];
      expect(history.some((r) => r.url === `/todos/${mockTodo.id}`)).toBe(true);
    });
  });

  it('삭제 취소 → 다이얼로그 닫힘 + DELETE 미호출', async () => {
    mock.onGet('/todos').reply(200, {
      success: true,
      data: [mockTodo],
      pagination: mockPagination,
    });

    renderPage();
    await screen.findByText(mockTodo.title);

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: '취소' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect((mock.history['delete'] ?? []).length).toBe(0);
  });

  it('빈 상태 화면에서 "새 할일 추가" 버튼을 클릭할 수 있다', async () => {
    mock.onGet('/todos').reply(200, {
      success: true,
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    renderPage();
    expect(await screen.findByText('첫 번째 할일을 등록해 보세요!')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '새 할일 추가' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
