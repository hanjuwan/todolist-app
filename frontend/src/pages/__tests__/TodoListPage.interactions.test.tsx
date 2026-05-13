import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import TodoListPage from '@/pages/TodoListPage';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/store/auth-store';

const CATEGORIES = [
  { id: '11111111-1111-1111-1111-111111111111', userId: null, name: '업무', isDefault: true, createdAt: 'x' },
];

const TODO = {
  id: 't-1',
  userId: 'u-1',
  categoryId: '11111111-1111-1111-1111-111111111111',
  title: '보고서 작성',
  description: null,
  dueDate: '2026-05-20',
  isCompleted: false,
  completedAt: null,
  createdAt: 'x',
  updatedAt: 'x',
};

function pagination(items: typeof TODO[]) {
  return { items, pagination: { page: 1, limit: 20, total: items.length, totalPages: 1 } };
}

function setup() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/todos']}>
        <TodoListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TodoListPage — toggle / delete / modal', () => {
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
    mock.onGet('/categories').reply(200, CATEGORIES);
  });
  afterEach(() => {
    mock.restore();
    useAuthStore.getState().clearToken();
  });

  it('+ 새 할일 추가 클릭 시 모달 오픈', async () => {
    mock.onGet('/todos').reply(200, pagination([TODO]));
    setup();
    await screen.findByTestId('todo-card-t-1');
    await userEvent.click(screen.getByTestId('add-todo-btn'));
    expect(await screen.findByTestId('todo-modal')).toBeInTheDocument();
    expect(screen.getByText('새 할일 추가')).toBeInTheDocument();
  });

  it('수정 버튼 클릭 시 수정 모달 오픈 (프리필)', async () => {
    mock.onGet('/todos').reply(200, pagination([TODO]));
    setup();
    await userEvent.click(await screen.findByTestId('todo-edit-t-1'));
    expect(await screen.findByText('할일 수정')).toBeInTheDocument();
    expect((screen.getByLabelText('제목') as HTMLInputElement).value).toBe('보고서 작성');
  });

  it('완료 토글: 한 번 클릭 → PATCH /todos/:id/complete + UI 즉시 반영', async () => {
    let completed = false;
    mock.onGet('/todos').reply(() => [
      200,
      pagination([{ ...TODO, isCompleted: completed }]),
    ]);
    mock.onPatch('/todos/t-1/complete').reply((config) => {
      const body = JSON.parse(config.data) as { isCompleted: boolean };
      completed = body.isCompleted;
      return [200, { ...TODO, isCompleted: completed }];
    });
    setup();
    const toggle = (await screen.findByTestId('todo-toggle-t-1')) as HTMLInputElement;
    expect(toggle.checked).toBe(false);
    await userEvent.click(toggle);
    await waitFor(() => {
      const cb = screen.getByTestId('todo-toggle-t-1') as HTMLInputElement;
      expect(cb.checked).toBe(true);
    });
    expect(mock.history.patch.some((r) => r.url === '/todos/t-1/complete')).toBe(true);
  });

  it('완료 토글: 서버 오류 시 UI 롤백', async () => {
    mock.onGet('/todos').reply(200, pagination([TODO]));
    mock.onPatch('/todos/t-1/complete').reply(500, {
      success: false,
      error: { code: 'INTERNAL', message: '서버 오류' },
    });
    setup();
    const toggle = (await screen.findByTestId('todo-toggle-t-1')) as HTMLInputElement;
    await userEvent.click(toggle);
    await waitFor(() => {
      const cb = screen.getByTestId('todo-toggle-t-1') as HTMLInputElement;
      expect(cb.checked).toBe(false);
    });
  });

  it('삭제 버튼 클릭 시 확인 다이얼로그 → 확인 클릭 시 DELETE', async () => {
    mock.onGet('/todos').reply(200, pagination([TODO]));
    mock.onDelete('/todos/t-1').reply(204);
    setup();
    await userEvent.click(await screen.findByTestId('todo-delete-t-1'));
    expect(await screen.findByTestId('confirm-dialog')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('confirm-ok'));
    await waitFor(() => {
      expect(mock.history.delete.some((r) => r.url === '/todos/t-1')).toBe(true);
    });
  });

  it('삭제 확인 다이얼로그에서 취소 클릭 시 DELETE 호출 안 함', async () => {
    mock.onGet('/todos').reply(200, pagination([TODO]));
    mock.onDelete('/todos/t-1').reply(204);
    setup();
    await userEvent.click(await screen.findByTestId('todo-delete-t-1'));
    await userEvent.click(screen.getByTestId('confirm-cancel'));
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    expect(mock.history.delete.length).toBe(0);
  });

  it('빈 상태에서 + 새 할일 추가 클릭 시 모달 오픈', async () => {
    mock.onGet('/todos').reply(200, pagination([]));
    setup();
    const emptyBtn = await screen.findByRole('button', { name: /\+ 새 할일 추가/ });
    await userEvent.click(emptyBtn);
    // 모달 또는 빈상태 버튼 중 하나가 동작하면 됨 — 빈상태 내부 버튼이 첫 번째로 매치되며 그것이 동작
    await waitFor(() => {
      expect(screen.getByTestId('todo-modal')).toBeInTheDocument();
    });
  });
});
