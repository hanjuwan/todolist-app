import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/store/auth-store';
import CategoriesPage from '@/pages/CategoriesPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mock = new MockAdapter(apiClient);

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderPage(client?: QueryClient) {
  const qc = client ?? makeClient();
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <CategoriesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const mockCategories = [
  { id: 'd1', name: '업무', isDefault: true, userId: null, createdAt: '2024-01-01' },
  { id: 'd2', name: '개인', isDefault: true, userId: null, createdAt: '2024-01-01' },
  { id: 'u1', name: '내 카테고리1', isDefault: false, userId: '1', createdAt: '2024-01-02' },
];

beforeEach(() => {
  useAuthStore.setState({
    token: 'test-token',
    user: { id: '1', email: 'a@b.com', name: '테스트' },
    isAuthenticated: true,
  });
  mock.onGet('/categories').reply(200, {
    success: true,
    data: mockCategories,
  });
  mockNavigate.mockClear();
});

afterEach(() => {
  mock.reset();
});

describe('CategoriesPage', () => {
  it('기본/사용자 카테고리가 각 섹션에 올바르게 분리 렌더링됨', async () => {
    renderPage();

    expect(await screen.findByText('기본 카테고리')).toBeInTheDocument();
    expect(screen.getByText('내 카테고리')).toBeInTheDocument();
    expect(screen.getByText('업무')).toBeInTheDocument();
    expect(screen.getByText('개인')).toBeInTheDocument();
    expect(screen.getByText('내 카테고리1')).toBeInTheDocument();
  });

  it('기본 카테고리의 수정/삭제 버튼이 disabled 상태이며 툴팁 제공', async () => {
    renderPage();

    await screen.findByText('기본 카테고리');

    const defaultSection = screen.getByText('기본 카테고리').closest('section')!;
    const editButtons = within(defaultSection).getAllByRole('button', { name: '수정' });
    const deleteButtons = within(defaultSection).getAllByRole('button', { name: '삭제' });

    editButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute('title', '기본 카테고리는 변경할 수 없습니다');
    });
    deleteButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute('title', '기본 카테고리는 변경할 수 없습니다');
    });
  });

  it('사용자 카테고리의 수정/삭제 버튼이 활성 상태', async () => {
    renderPage();

    await screen.findByText('내 카테고리1');

    const userSection = screen.getByText('내 카테고리').closest('section')!;
    const editButton = within(userSection).getByRole('button', { name: '수정' });
    const deleteButton = within(userSection).getByRole('button', { name: '삭제' });

    expect(editButton).not.toBeDisabled();
    expect(deleteButton).not.toBeDisabled();
  });

  it('빈 이름으로 추가 버튼 클릭 시 클라이언트 차단', async () => {
    renderPage();

    await screen.findByText('내 카테고리');

    const addButton = screen.getByRole('button', { name: '추가' });
    expect(addButton).toBeDisabled();

    fireEvent.click(addButton);

    expect((mock.history['post'] ?? []).length).toBe(0);
  });

  it('추가 성공 → POST 호출 + input 초기화', async () => {
    mock.onPost('/categories').reply(201, {
      success: true,
      data: { id: 'u2', name: '새 카테고리', isDefault: false, userId: '1', createdAt: '2024-01-03' },
    });

    renderPage();

    await screen.findByText('내 카테고리');

    const input = screen.getByPlaceholderText('새 카테고리 이름');
    fireEvent.change(input, { target: { value: '새 카테고리' } });

    const addButton = screen.getByRole('button', { name: '추가' });
    fireEvent.click(addButton);

    await waitFor(() => {
      const history = mock.history['post'] ?? [];
      expect(history.some((r) => r.url === '/categories')).toBe(true);
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('새 카테고리 이름')).toHaveValue('');
    });
  });

  it('추가 시 409 CATEGORY_NAME_DUPLICATED → 친화 오류 메시지 표시', async () => {
    mock.onPost('/categories').reply(409, {
      success: false,
      error: { code: 'CATEGORY_NAME_DUPLICATED', message: '중복' },
    });

    renderPage();

    await screen.findByText('내 카테고리');

    const input = screen.getByPlaceholderText('새 카테고리 이름');
    fireEvent.change(input, { target: { value: '업무' } });
    fireEvent.click(screen.getByRole('button', { name: '추가' }));

    expect(await screen.findByText('이미 사용 중인 카테고리 이름입니다.')).toBeInTheDocument();
  });

  it('사용자 카테고리 수정 → PATCH 호출 → 보기 모드 복귀', async () => {
    mock.onPatch('/categories/u1').reply(200, {
      success: true,
      data: { id: 'u1', name: '수정된 카테고리', isDefault: false, userId: '1', createdAt: '2024-01-02' },
    });

    renderPage();

    await screen.findByText('내 카테고리1');

    const userSection = screen.getByText('내 카테고리').closest('section')!;
    fireEvent.click(within(userSection).getByRole('button', { name: '수정' }));

    const editInput = within(userSection).getByDisplayValue('내 카테고리1');
    fireEvent.change(editInput, { target: { value: '수정된 카테고리' } });
    fireEvent.click(within(userSection).getByRole('button', { name: '저장' }));

    await waitFor(() => {
      const history = mock.history['patch'] ?? [];
      expect(history.some((r) => r.url === '/categories/u1')).toBe(true);
    });

    await waitFor(() => {
      expect(within(userSection).queryByRole('button', { name: '저장' })).not.toBeInTheDocument();
    });
  });

  it('삭제 시 연결 할일 존재(409 CATEGORY_HAS_TODOS) → 친화 오류 메시지', async () => {
    mock.onDelete('/categories/u1').reply(409, {
      success: false,
      error: { code: 'CATEGORY_HAS_TODOS', message: '연결된 할일 존재' },
    });

    renderPage();

    await screen.findByText('내 카테고리1');

    const userSection = screen.getByText('내 카테고리').closest('section')!;
    fireEvent.click(within(userSection).getByRole('button', { name: '삭제' }));

    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: '확인' }));

    expect(
      await screen.findByText('이 카테고리에 연결된 할일이 있어 삭제할 수 없습니다.'),
    ).toBeInTheDocument();
  });

  it('삭제 성공 → DELETE 호출 → 다이얼로그 닫힘', async () => {
    mock.onDelete('/categories/u1').reply(204);

    renderPage();

    await screen.findByText('내 카테고리1');

    const userSection = screen.getByText('내 카테고리').closest('section')!;
    fireEvent.click(within(userSection).getByRole('button', { name: '삭제' }));

    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: '확인' }));

    await waitFor(() => {
      const history = mock.history['delete'] ?? [];
      expect(history.some((r) => r.url === '/categories/u1')).toBe(true);
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
