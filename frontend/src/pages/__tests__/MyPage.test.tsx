import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import MyPage from '@/pages/MyPage';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/store/auth-store';

const ME = {
  id: 'u-1',
  email: 'kjb980@kjbank.com',
  name: '홍길동',
  createdAt: '2026-05-13T00:00:00Z',
  updatedAt: '2026-05-13T00:00:00Z',
};

function setup() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/mypage']}>
        <Routes>
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/login" element={<div data-testid="page-login" />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('MyPage', () => {
  let mock: MockAdapter;
  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    useAuthStore.getState().setToken('jwt', ME);
    mock.onGet('/users/me').reply(200, ME);
  });
  afterEach(() => {
    mock.restore();
    useAuthStore.getState().clearToken();
  });

  it('로드 후 현재 정보 프리필 (이메일 readonly, 이름 입력)', async () => {
    setup();
    expect(await screen.findByDisplayValue(ME.email)).toHaveAttribute('readonly');
    expect((screen.getByLabelText('이름') as HTMLInputElement).value).toBe(ME.name);
  });

  it('이름 수정 성공 시 토스트 표시', async () => {
    mock.onPatch('/users/me').reply(200, { ...ME, name: '새이름' });
    setup();
    const nameInput = (await screen.findByLabelText('이름')) as HTMLInputElement;
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, '새이름');
    await userEvent.click(screen.getByTestId('profile-save-btn'));
    expect(await screen.findByTestId('profile-toast')).toHaveTextContent(/완료/);
  });

  it('새 비밀번호 확인 불일치 시 클라이언트 오류 (API 미호출)', async () => {
    setup();
    await screen.findByLabelText('이름');
    await userEvent.type(screen.getByLabelText('현재 비밀번호'), 'old-pw');
    await userEvent.type(screen.getByLabelText('새 비밀번호'), 'newpass1');
    await userEvent.type(screen.getByLabelText('새 비밀번호 확인'), 'mismatch');
    await userEvent.click(screen.getByTestId('profile-save-btn'));
    expect(await screen.findByText(/새 비밀번호가 일치하지 않습니다/)).toBeInTheDocument();
    expect(mock.history.patch.length).toBe(0);
  });

  it('비밀번호 변경 성공 시 토스트', async () => {
    mock.onPatch('/users/me').reply(200, ME);
    setup();
    await screen.findByLabelText('이름');
    await userEvent.type(screen.getByLabelText('현재 비밀번호'), 'old-pw');
    await userEvent.type(screen.getByLabelText('새 비밀번호'), 'newpass1');
    await userEvent.type(screen.getByLabelText('새 비밀번호 확인'), 'newpass1');
    await userEvent.click(screen.getByTestId('profile-save-btn'));
    expect(await screen.findByTestId('profile-toast')).toBeInTheDocument();
  });

  it('현재 PW 불일치(401) 시 인라인 오류', async () => {
    mock.onPatch('/users/me').reply(401, {
      success: false,
      error: { code: 'INVALID_CURRENT_PASSWORD', message: '...' },
    });
    setup();
    await screen.findByLabelText('이름');
    await userEvent.type(screen.getByLabelText('현재 비밀번호'), 'wrong');
    await userEvent.type(screen.getByLabelText('새 비밀번호'), 'newpass1');
    await userEvent.type(screen.getByLabelText('새 비밀번호 확인'), 'newpass1');
    await userEvent.click(screen.getByTestId('profile-save-btn'));
    expect(await screen.findByText(/현재 비밀번호가 올바르지 않습니다/)).toBeInTheDocument();
  });

  it('회원 탈퇴 2단계 확인: 문구+비밀번호 입력 후 DELETE → /login 이동 + 토큰 초기화', async () => {
    mock.onDelete('/users/me').reply(204);
    setup();
    await screen.findByLabelText('이름');
    await userEvent.click(screen.getByTestId('withdraw-open-btn'));
    expect(screen.getByTestId('withdraw-dialog')).toBeInTheDocument();

    const confirmBtn = screen.getByTestId('withdraw-confirm-btn');
    expect(confirmBtn).toBeDisabled();

    await userEvent.type(screen.getByTestId('withdraw-phrase-input'), '탈퇴합니다');
    await userEvent.type(screen.getByLabelText('현재 비밀번호 (탈퇴 확인)'), 'pw');
    expect(confirmBtn).not.toBeDisabled();
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBeNull();
    });
    expect(await screen.findByTestId('page-login')).toBeInTheDocument();
  });

  it('탈퇴: 확인 문구만 입력 시 버튼 disabled', async () => {
    setup();
    await screen.findByLabelText('이름');
    await userEvent.click(screen.getByTestId('withdraw-open-btn'));
    await userEvent.type(screen.getByTestId('withdraw-phrase-input'), '탈퇴합니다');
    expect(screen.getByTestId('withdraw-confirm-btn')).toBeDisabled();
  });

  it('탈퇴 401 오류 시 인라인 표시', async () => {
    mock.onDelete('/users/me').reply(401, {
      success: false,
      error: { code: 'INVALID_CURRENT_PASSWORD', message: '...' },
    });
    setup();
    await screen.findByLabelText('이름');
    await userEvent.click(screen.getByTestId('withdraw-open-btn'));
    await userEvent.type(screen.getByTestId('withdraw-phrase-input'), '탈퇴합니다');
    await userEvent.type(screen.getByLabelText('현재 비밀번호 (탈퇴 확인)'), 'wrong');
    await userEvent.click(screen.getByTestId('withdraw-confirm-btn'));
    expect(await screen.findByTestId('withdraw-error')).toHaveTextContent(/비밀번호/);
  });
});
