import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/store/auth-store';
import TodoListPage from '@/pages/TodoListPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
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
});

afterEach(() => {
  mock.reset();
});

describe('TodoListPage - 캘린더 통합', () => {
  it('캘린더 영역이 페이지에 렌더링된다', async () => {
    const client = makeClient();
    renderPage(client);

    expect(await screen.findByTestId('todo-calendar')).toBeInTheDocument();
  });
});
