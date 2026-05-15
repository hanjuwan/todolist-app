import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/store/auth-store';
import MyPage from '@/pages/MyPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mock = new MockAdapter(apiClient);

const mockUser = {
  id: 'u1',
  email: 'test@example.com',
  name: '홍길동',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

function renderPage() {
  return render(
    <QueryClientProvider client={makeClient()}>
      <MemoryRouter>
        <MyPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  useAuthStore.setState({ token: 'test-token', user: { id: 'u1', email: 'test@example.com', name: '홍길동' }, isAuthenticated: true });
  mock.onGet('/users/me').reply(200, { success: true, data: mockUser });
});

afterEach(() => {
  mock.reset();
  mockNavigate.mockReset();
});

describe('MyPage', () => {
  it('초기 로드: GET /users/me 호출 → 이메일 readonly 표시 + 이름 프리필', async () => {
    renderPage();
    expect(await screen.findByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('홍길동')).toBeInTheDocument();
    const emailInput = screen.getByDisplayValue('test@example.com');
    expect(emailInput).toHaveAttribute('readonly');
  });

  it('이름 수정 → 저장 → PATCH 호출 + 토스트 표시', async () => {
    mock.onPatch('/users/me').reply(200, { success: true, data: { ...mockUser, name: '김철수' } });

    renderPage();
    await screen.findByDisplayValue('홍길동');

    const nameInput = screen.getByDisplayValue('홍길동');
    fireEvent.change(nameInput, { target: { value: '김철수' } });

    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(screen.getByTestId('profile-toast')).toBeInTheDocument();
    });

    expect(mock.history.patch.length).toBe(1);
    expect(JSON.parse(mock.history.patch[0].data)).toMatchObject({ name: '김철수' });
  });

  it('새 비밀번호 ≠ 새 비밀번호 확인 → 클라이언트 검증 실패 메시지', async () => {
    renderPage();
    await screen.findByDisplayValue('홍길동');

    fireEvent.change(screen.getByLabelText('현재 비밀번호'), { target: { value: 'current123' } });
    fireEvent.change(screen.getByLabelText('새 비밀번호'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText('새 비밀번호 확인'), { target: { value: 'different123' } });

    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByText('새 비밀번호가 일치하지 않습니다.')).toBeInTheDocument();
  });

  it('비밀번호 변경 성공 → PATCH 호출 (currentPassword + newPassword 페어)', async () => {
    mock.onPatch('/users/me').reply(200, { success: true, data: mockUser });

    renderPage();
    await screen.findByDisplayValue('홍길동');

    fireEvent.change(screen.getByLabelText('현재 비밀번호'), { target: { value: 'current123' } });
    fireEvent.change(screen.getByLabelText('새 비밀번호'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText('새 비밀번호 확인'), { target: { value: 'newpass123' } });

    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(screen.getByTestId('profile-toast')).toBeInTheDocument();
    });

    expect(mock.history.patch.length).toBe(1);
    const body = JSON.parse(mock.history.patch[0].data);
    expect(body).toMatchObject({ currentPassword: 'current123', newPassword: 'newpass123' });
  });

  it('비밀번호 변경 401 INVALID_CURRENT_PASSWORD → currentPassword 필드 하단 인라인 오류', async () => {
    mock.onPatch('/users/me').reply(401, {
      success: false,
      error: { code: 'INVALID_CURRENT_PASSWORD', message: '현재 비밀번호가 올바르지 않습니다.' },
    });

    renderPage();
    await screen.findByDisplayValue('홍길동');

    fireEvent.change(screen.getByLabelText('현재 비밀번호'), { target: { value: 'wrongpass' } });
    fireEvent.change(screen.getByLabelText('새 비밀번호'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText('새 비밀번호 확인'), { target: { value: 'newpass123' } });

    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByText('현재 비밀번호가 올바르지 않습니다.')).toBeInTheDocument();
  });

  it('회원 탈퇴: 정확한 문구 + 비밀번호 입력 후 탈퇴 → DELETE 호출 → clearToken + navigate', async () => {
    mock.onDelete('/users/me').reply(204);

    renderPage();
    await screen.findByDisplayValue('홍길동');

    fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('탈퇴 확인 문구'), { target: { value: '탈퇴합니다' } });
    fireEvent.change(screen.getByLabelText('탈퇴 비밀번호'), { target: { value: 'mypassword' } });

    fireEvent.click(screen.getByRole('button', { name: '탈퇴하기' }));

    await waitFor(() => {
      expect(mock.history.delete.length).toBe(1);
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { withdrawn: true } });
  });

  it('다이얼로그에서 탈퇴합니다만 입력 (비밀번호 미입력) → 탈퇴 버튼 disabled', async () => {
    renderPage();
    await screen.findByDisplayValue('홍길동');

    fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));

    fireEvent.change(screen.getByLabelText('탈퇴 확인 문구'), { target: { value: '탈퇴합니다' } });

    const withdrawBtn = screen.getByRole('button', { name: '탈퇴하기' });
    expect(withdrawBtn).toBeDisabled();
  });

  it('탈퇴 시 401 INVALID_CURRENT_PASSWORD → 다이얼로그 내 인라인 오류 표시', async () => {
    mock.onDelete('/users/me').reply(401, {
      success: false,
      error: { code: 'INVALID_CURRENT_PASSWORD', message: '현재 비밀번호가 올바르지 않습니다.' },
    });

    renderPage();
    await screen.findByDisplayValue('홍길동');

    fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));

    fireEvent.change(screen.getByLabelText('탈퇴 확인 문구'), { target: { value: '탈퇴합니다' } });
    fireEvent.change(screen.getByLabelText('탈퇴 비밀번호'), { target: { value: 'wrongpass' } });

    fireEvent.click(screen.getByRole('button', { name: '탈퇴하기' }));

    expect(await screen.findByText('현재 비밀번호가 올바르지 않습니다.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
