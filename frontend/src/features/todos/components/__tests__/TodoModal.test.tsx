import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import TodoModal from '@/features/todos/components/TodoModal';
import { apiClient } from '@/lib/api-client';
import type { Category } from '@/features/categories/types/category.types';
import type { Todo } from '@/features/todos/types/todo.types';

const CATEGORIES: Category[] = [
  { id: '11111111-1111-1111-1111-111111111111', userId: null, name: '업무', isDefault: true, createdAt: 'x' },
  { id: '22222222-2222-2222-2222-222222222222', userId: null, name: '개인', isDefault: true, createdAt: 'x' },
];

const EXISTING_TODO: Todo = {
  id: 't-1',
  userId: 'u-1',
  categoryId: '22222222-2222-2222-2222-222222222222',
  title: '기존 할일',
  description: '메모',
  dueDate: '2026-05-20',
  isCompleted: false,
  completedAt: null,
  createdAt: 'x',
  updatedAt: 'x',
};

function renderModal({
  open = true,
  todo = null,
  onClose = vi.fn(),
}: { open?: boolean; todo?: Todo | null; onClose?: () => void } = {}) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const utils = render(
    <QueryClientProvider client={qc}>
      <TodoModal open={open} onClose={onClose} todo={todo} categories={CATEGORIES} />
    </QueryClientProvider>,
  );
  return { ...utils, qc, onClose };
}

describe('TodoModal', () => {
  let mock: MockAdapter;
  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });
  afterEach(() => mock.restore());

  it('open=false면 렌더 안 함', () => {
    renderModal({ open: false });
    expect(screen.queryByTestId('todo-modal')).not.toBeInTheDocument();
  });

  it('등록 모드: 빈 폼', () => {
    renderModal();
    expect(screen.getByText('새 할일 추가')).toBeInTheDocument();
    expect((screen.getByLabelText('제목') as HTMLInputElement).value).toBe('');
  });

  it('수정 모드: 프리필', () => {
    renderModal({ todo: EXISTING_TODO });
    expect(screen.getByText('할일 수정')).toBeInTheDocument();
    expect((screen.getByLabelText('제목') as HTMLInputElement).value).toBe('기존 할일');
    expect((screen.getByLabelText('마감일') as HTMLInputElement).value).toBe('2026-05-20');
    expect((screen.getByLabelText('카테고리') as HTMLSelectElement).value).toBe('22222222-2222-2222-2222-222222222222');
  });

  it('제목 누락 시 zod 인라인 오류', async () => {
    renderModal();
    await userEvent.click(screen.getByTestId('todo-modal-save'));
    expect(await screen.findByText(/제목을 입력하세요/)).toBeInTheDocument();
  });

  it('등록 성공 시 onClose 호출 + POST /todos', async () => {
    mock.onPost('/todos').reply(201, {
      id: 'new-1',
      userId: 'u-1',
      categoryId: '11111111-1111-1111-1111-111111111111',
      title: '새 할일',
      description: null,
      dueDate: null,
      isCompleted: false,
      completedAt: null,
      createdAt: 'x',
      updatedAt: 'x',
    });
    const { onClose } = renderModal();
    await userEvent.type(screen.getByLabelText('제목'), '새 할일');
    await userEvent.click(screen.getByTestId('todo-modal-save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mock.history.post[0].url).toBe('/todos');
  });

  it('수정 성공 시 PATCH /todos/:id 호출', async () => {
    mock.onPatch('/todos/t-1').reply(200, { ...EXISTING_TODO, title: '수정됨' });
    const { onClose } = renderModal({ todo: EXISTING_TODO });
    const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, '수정됨');
    await userEvent.click(screen.getByTestId('todo-modal-save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mock.history.patch[0].url).toBe('/todos/t-1');
  });

  it('서버 오류 시 modal 유지 + 오류 표시', async () => {
    mock.onPost('/todos').reply(500, {
      success: false,
      error: { code: 'INTERNAL', message: '서버 오류' },
    });
    const { onClose } = renderModal();
    await userEvent.type(screen.getByLabelText('제목'), '실패');
    await userEvent.click(screen.getByTestId('todo-modal-save'));
    expect(await screen.findByTestId('todo-modal-error')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('취소 버튼 클릭 시 onClose 호출', async () => {
    const { onClose } = renderModal();
    await userEvent.click(screen.getByTestId('todo-modal-cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
