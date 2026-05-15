import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/store/auth-store';
import TodoListPage from '@/pages/TodoListPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderPage(client: QueryClient) {
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <TodoListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const mock = new MockAdapter(apiClient);

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
  mock.onGet('/todos').reply(200, {
    success: true,
    data: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  });
  mockNavigate.mockClear();
});

afterEach(() => {
  mock.reset();
});

describe('TodoListPage', () => {
  it('초기 렌더링 시 todos-page testid 요소가 존재한다', async () => {
    const client = makeClient();
    renderPage(client);
    expect(screen.getByTestId('todos-page')).toBeInTheDocument();
  });

  it('카테고리 필터 변경 시 새 categoryId로 API가 재호출된다', async () => {
    const client = makeClient();
    renderPage(client);

    await screen.findByRole('option', { name: '업무' });

    mock.resetHistory();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cat1' } });

    await waitFor(() => {
      const history = mock.history['get'] ?? [];
      const todosCall = history.find((r) => r.url === '/todos' && r.params?.categoryId === 'cat1');
      expect(todosCall).toBeDefined();
    });
  });

  it('완료 필터 변경 시 isCompleted 파라미터가 전달된다', async () => {
    const client = makeClient();
    renderPage(client);

    await screen.findByRole('radio', { name: '완료' });
    fireEvent.click(screen.getByRole('radio', { name: '완료' }));

    await waitFor(() => {
      const history = mock.history['get'] ?? [];
      const todosCall = history.find((r) => r.url === '/todos' && r.params?.isCompleted === 'true');
      expect(todosCall).toBeDefined();
    });
  });

  it('할일 없을 때(필터 없음) "첫 번째 할일을 등록해 보세요!" 표시', async () => {
    const client = makeClient();
    renderPage(client);
    expect(await screen.findByText('첫 번째 할일을 등록해 보세요!')).toBeInTheDocument();
  });

  it('할일 없을 때(필터 있음) "해당 조건에 맞는 할일이 없습니다." 표시', async () => {
    const client = makeClient();
    renderPage(client);

    await screen.findByRole('radio', { name: '완료' });
    fireEvent.click(screen.getByRole('radio', { name: '완료' }));

    expect(await screen.findByText('해당 조건에 맞는 할일이 없습니다.')).toBeInTheDocument();
  });

  it('로그아웃 버튼 클릭 시 clearToken + /login navigate 호출', async () => {
    const client = makeClient();
    renderPage(client);

    await screen.findByRole('button', { name: '로그아웃' });
    fireEvent.click(screen.getByRole('button', { name: '로그아웃' }));

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('네비게이션 링크가 올바른 href를 가진다', async () => {
    const client = makeClient();
    renderPage(client);

    expect(screen.getByRole('link', { name: '할일 목록' })).toHaveAttribute('href', '/todos');
    expect(screen.getByRole('link', { name: '카테고리' })).toHaveAttribute('href', '/categories');
    expect(screen.getByRole('link', { name: '마이페이지' })).toHaveAttribute('href', '/mypage');
  });

  it('API 오류 시 오류 메시지가 표시된다', async () => {
    mock.reset();
    mock.onGet('/categories').reply(200, { success: true, data: [] });
    mock.onGet('/todos').reply(500, { error: { code: 'SERVER_ERROR', message: '서버 오류' } });

    const client = makeClient();
    renderPage(client);

    expect(await screen.findByText('오류가 발생했습니다.')).toBeInTheDocument();
  });
});
