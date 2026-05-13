import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import CategoriesPage from '@/pages/CategoriesPage';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/store/auth-store';

const DEFAULT_CAT = {
  id: 'd0000000-0000-0000-0000-000000000001',
  userId: null,
  name: '업무',
  isDefault: true,
  createdAt: 'x',
};
const CUSTOM_CAT = {
  id: 'c0000000-0000-0000-0000-000000000001',
  userId: 'u-1',
  name: '사이드 프로젝트',
  isDefault: false,
  createdAt: 'x',
};

function setup() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <CategoriesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('CategoriesPage', () => {
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
  });
  afterEach(() => {
    mock.restore();
    useAuthStore.getState().clearToken();
  });

  it('기본/사용자 카테고리 분리 표시', async () => {
    mock.onGet('/categories').reply(200, [DEFAULT_CAT, CUSTOM_CAT]);
    setup();
    await screen.findByTestId(`category-row-${DEFAULT_CAT.id}`);
    expect(screen.getByTestId(`category-row-${CUSTOM_CAT.id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`category-default-badge-${DEFAULT_CAT.id}`)).toBeInTheDocument();
  });

  it('기본 카테고리 수정/삭제 버튼 비활성 + 툴팁', async () => {
    mock.onGet('/categories').reply(200, [DEFAULT_CAT]);
    setup();
    const editBtn = await screen.findByTestId(`category-edit-btn-${DEFAULT_CAT.id}`);
    const delBtn = screen.getByTestId(`category-delete-btn-${DEFAULT_CAT.id}`);
    expect(editBtn).toBeDisabled();
    expect(delBtn).toBeDisabled();
    expect(editBtn).toHaveAttribute('title', '기본 카테고리는 변경할 수 없습니다.');
  });

  it('사용자 카테고리는 수정/삭제 활성', async () => {
    mock.onGet('/categories').reply(200, [CUSTOM_CAT]);
    setup();
    const editBtn = await screen.findByTestId(`category-edit-btn-${CUSTOM_CAT.id}`);
    expect(editBtn).not.toBeDisabled();
    expect(screen.getByTestId(`category-delete-btn-${CUSTOM_CAT.id}`)).not.toBeDisabled();
  });

  it('빈 이름 추가 시 zod 인라인 오류', async () => {
    mock.onGet('/categories').reply(200, [DEFAULT_CAT]);
    setup();
    await screen.findByTestId(`category-row-${DEFAULT_CAT.id}`);
    await userEvent.click(screen.getByTestId('category-add-btn'));
    expect(await screen.findByTestId('category-field-error')).toBeInTheDocument();
  });

  it('카테고리 추가 성공 시 목록 갱신 + 입력 초기화', async () => {
    const created = { ...CUSTOM_CAT, name: '새 카테고리' };
    let returned: Array<typeof DEFAULT_CAT | typeof CUSTOM_CAT> = [DEFAULT_CAT];
    mock.onGet('/categories').reply(() => [200, returned]);
    mock.onPost('/categories').reply(() => {
      returned = [DEFAULT_CAT, created];
      return [201, created];
    });
    setup();
    await screen.findByTestId(`category-row-${DEFAULT_CAT.id}`);
    await userEvent.type(screen.getByTestId('category-name-input'), '새 카테고리');
    await userEvent.click(screen.getByTestId('category-add-btn'));
    await screen.findByTestId(`category-row-${created.id}`);
    expect((screen.getByTestId('category-name-input') as HTMLInputElement).value).toBe('');
  });

  it('중복 카테고리명(409) 시 친화 오류 메시지', async () => {
    mock.onGet('/categories').reply(200, [DEFAULT_CAT]);
    mock.onPost('/categories').reply(409, {
      success: false,
      error: { code: 'CATEGORY_NAME_DUPLICATED', message: 'dup' },
    });
    setup();
    await screen.findByTestId(`category-row-${DEFAULT_CAT.id}`);
    await userEvent.type(screen.getByTestId('category-name-input'), '업무');
    await userEvent.click(screen.getByTestId('category-add-btn'));
    expect(await screen.findByTestId('category-server-error')).toHaveTextContent(/이미 사용 중/);
  });

  it('사용자 카테고리 수정 → PATCH 호출', async () => {
    mock.onGet('/categories').reply(200, [CUSTOM_CAT]);
    mock.onPatch(`/categories/${CUSTOM_CAT.id}`).reply(200, { ...CUSTOM_CAT, name: '수정됨' });
    setup();
    await userEvent.click(await screen.findByTestId(`category-edit-btn-${CUSTOM_CAT.id}`));
    const input = screen.getByTestId(`category-edit-input-${CUSTOM_CAT.id}`) as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, '수정됨');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() => {
      expect(mock.history.patch.some((r) => r.url === `/categories/${CUSTOM_CAT.id}`)).toBe(true);
    });
  });

  it('삭제 시 연결 할일 존재(409) 친화 오류', async () => {
    mock.onGet('/categories').reply(200, [CUSTOM_CAT]);
    mock.onDelete(`/categories/${CUSTOM_CAT.id}`).reply(409, {
      success: false,
      error: { code: 'CATEGORY_HAS_TODOS', message: 'has todos' },
    });
    setup();
    await userEvent.click(await screen.findByTestId(`category-delete-btn-${CUSTOM_CAT.id}`));
    await userEvent.click(screen.getByTestId('confirm-ok'));
    expect(
      await screen.findByTestId(`category-server-error-${CUSTOM_CAT.id}`),
    ).toHaveTextContent(/연결된 할일/);
  });

  it('삭제 성공 시 목록에서 제거', async () => {
    let cats: Array<typeof CUSTOM_CAT> = [CUSTOM_CAT];
    mock.onGet('/categories').reply(() => [200, cats]);
    mock.onDelete(`/categories/${CUSTOM_CAT.id}`).reply(() => {
      cats = [];
      return [204];
    });
    setup();
    await userEvent.click(await screen.findByTestId(`category-delete-btn-${CUSTOM_CAT.id}`));
    await userEvent.click(screen.getByTestId('confirm-ok'));
    await waitFor(() => {
      expect(screen.queryByTestId(`category-row-${CUSTOM_CAT.id}`)).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
  });
});
