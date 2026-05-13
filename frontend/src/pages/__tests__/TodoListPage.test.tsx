import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import TodoListPage from '@/pages/TodoListPage';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/store/auth-store';

// 응답은 camelCase (백엔드 mapRow 이후)
const CAT_RESPONSE = [
  { id: 'cat-1', userId: null, name: '업무', isDefault: true, createdAt: 'x' },
  { id: 'cat-2', userId: null, name: '개인', isDefault: true, createdAt: 'x' },
];

const TODOS = [
  {
    id: 't-1',
    userId: 'u-1',
    categoryId: 'cat-1',
    title: '보고서 작성',
    description: '5월 마감',
    dueDate: '2026-05-20',
    isCompleted: false,
    completedAt: null,
    createdAt: '2026-05-13T00:00:00Z',
    updatedAt: '2026-05-13T00:00:00Z',
  },
  {
    id: 't-2',
    userId: 'u-1',
    categoryId: 'cat-2',
    title: '헬스장 등록',
    description: null,
    dueDate: null,
    isCompleted: true,
    completedAt: '2026-05-12T00:00:00Z',
    createdAt: '2026-05-12T00:00:00Z',
    updatedAt: '2026-05-12T00:00:00Z',
  },
];

function pagination(items: typeof TODOS) {
  return {
    items,
    pagination: { page: 1, limit: 20, total: items.length, totalPages: 1 },
  };
}

function setup() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/todos']}>
        <Routes>
          <Route path="/todos" element={<TodoListPage />} />
          <Route path="/login" element={<div data-testid="page-login" />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TodoListPage', () => {
  let mock: MockAdapter;
  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    useAuthStore.getState().setToken('jwt', {
      id: 'u-1',
      email: 'a@b.co',
      name: '홍길동',
      createdAt: 'x',
      updatedAt: 'x',
    });
    mock.onGet('/categories').reply(200, CAT_RESPONSE);
  });
  afterEach(() => {
    mock.restore();
    useAuthStore.getState().clearToken();
  });

  it('초기 렌더 시 할일 카드 목록 표시', async () => {
    mock.onGet('/todos').reply(200, pagination(TODOS));
    setup();
    expect(await screen.findByTestId('todo-card-t-1')).toBeInTheDocument();
    expect(screen.getByTestId('todo-card-t-2')).toBeInTheDocument();
    expect(screen.getByText('보고서 작성')).toBeInTheDocument();
  });

  it('카테고리 필터 변경 시 queryKey 변경 → 재호출', async () => {
    mock.onGet('/todos').reply((config) => {
      const params = config.params ?? {};
      if (params.categoryId === 'cat-1') {
        return [200, pagination([TODOS[0]])];
      }
      return [200, pagination(TODOS)];
    });
    setup();
    await screen.findByTestId('todo-card-t-1');
    expect(screen.queryByTestId('todo-card-t-2')).toBeInTheDocument();

    await userEvent.selectOptions(await screen.findByLabelText('카테고리'), 'cat-1');
    await waitFor(() => {
      expect(screen.queryByTestId('todo-card-t-2')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('todo-card-t-1')).toBeInTheDocument();
  });

  it('완료 여부 필터 변경 시 재호출', async () => {
    const requests: Array<Record<string, unknown>> = [];
    mock.onGet('/todos').reply((config) => {
      requests.push(config.params ?? {});
      return [200, pagination(TODOS)];
    });
    setup();
    await screen.findByTestId('todo-card-t-1');
    await userEvent.click(await screen.findByLabelText('완료'));
    await waitFor(() => {
      expect(requests.some((r) => r.isCompleted === true)).toBe(true);
    });
  });

  it('빈 결과(필터 미적용) 시 첫 할일 안내', async () => {
    mock.onGet('/todos').reply(200, pagination([]));
    setup();
    expect(await screen.findByTestId('todos-empty')).toHaveTextContent(/첫 번째 할일을 등록/);
  });

  it('빈 결과(필터 적용) 시 필터 초기화 안내 + 초기화 버튼', async () => {
    mock.onGet('/todos').reply((config) => {
      const isFiltered = (config.params ?? {}).categoryId !== undefined;
      return [200, pagination(isFiltered ? [] : TODOS)];
    });
    setup();
    await screen.findByTestId('todo-card-t-1');
    await userEvent.selectOptions(screen.getByLabelText('카테고리'), 'cat-1');
    expect(await screen.findByTestId('todos-empty')).toHaveTextContent(/해당 조건/);
    const resetBtn = screen.getAllByText('필터 초기화')[0];
    await userEvent.click(resetBtn);
    await waitFor(() => {
      expect(screen.queryByTestId('todos-empty')).not.toBeInTheDocument();
    });
  });

  it('네비게이션: 카테고리/마이페이지 링크 + 로그아웃 버튼 존재', async () => {
    mock.onGet('/todos').reply(200, pagination(TODOS));
    setup();
    await screen.findByTestId('app-header');
    expect(screen.getByRole('link', { name: '할일 목록' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '카테고리' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '마이페이지' })).toBeInTheDocument();
    expect(screen.getByTestId('logout-btn')).toBeInTheDocument();
  });

  it('로그아웃 클릭 시 토큰 초기화 + /login 이동', async () => {
    mock.onGet('/todos').reply(200, pagination(TODOS));
    mock.onPost('/auth/logout').reply(200, { ok: true });
    setup();
    await screen.findByTestId('app-header');
    await userEvent.click(screen.getByTestId('logout-btn'));
    await waitFor(() => {
      expect(useAuthStore.getState().token).toBeNull();
    });
    expect(await screen.findByTestId('page-login')).toBeInTheDocument();
  });

  it('서버 오류 시 에러 UI 표시', async () => {
    mock.onGet('/todos').reply(500, '<html/>');
    setup();
    expect(await screen.findByTestId('todos-error')).toBeInTheDocument();
  });
});
