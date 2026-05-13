import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import LoginForm from '@/features/auth/components/LoginForm';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/store/auth-store';

const USER = {
  id: 'u-1',
  email: 'a@b.co',
  name: 'tester',
  createdAt: '2026-05-13T00:00:00Z',
  updatedAt: '2026-05-13T00:00:00Z',
};

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/todos" element={<div data-testid="page-todos">할일 목록</div>} />
          <Route path="/register" element={<div data-testid="page-register">회원가입</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LoginForm', () => {
  let mock: MockAdapter;
  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    useAuthStore.getState().clearToken();
  });
  afterEach(() => mock.restore());

  it('이메일 형식 오류 시 인라인 메시지', async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByLabelText('이메일'), 'not-email');
    await user.type(screen.getByLabelText('비밀번호'), 'pw');
    await user.click(screen.getByRole('button', { name: /로그인하기/ }));
    expect(await screen.findByText(/이메일 형식/)).toBeTruthy();
  });

  it('성공 시 토큰 저장 + /todos 이동', async () => {
    mock.onPost('/auth/login').reply(200, { accessToken: 'jwt-x', user: USER });
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByLabelText('이메일'), 'a@b.co');
    await user.type(screen.getByLabelText('비밀번호'), 'pw12345!');
    await user.click(screen.getByRole('button', { name: /로그인하기/ }));
    await waitFor(() => expect(screen.getByTestId('page-todos')).toBeTruthy());
    expect(useAuthStore.getState().token).toBe('jwt-x');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('401 실패 시 친화 메시지 + 비밀번호 초기화', async () => {
    mock.onPost('/auth/login').reply(401, {
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'invalid' },
    });
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByLabelText('이메일'), 'a@b.co');
    const pwInput = screen.getByLabelText('비밀번호') as HTMLInputElement;
    await user.type(pwInput, 'wrong-pw');
    await user.click(screen.getByRole('button', { name: /로그인하기/ }));
    expect(await screen.findByTestId('login-error')).toHaveTextContent(/이메일 또는 비밀번호/);
    expect(pwInput.value).toBe('');
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('회원가입 링크 클릭 시 /register 이동', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('link', { name: /회원가입하기/ }));
    expect(await screen.findByTestId('page-register')).toBeTruthy();
  });

  it('비밀번호 show/hide 토글이 input type 전환', async () => {
    const user = userEvent.setup();
    setup();
    const pw = screen.getByLabelText('비밀번호') as HTMLInputElement;
    expect(pw.type).toBe('password');
    await user.click(screen.getByRole('button', { name: /비밀번호 보기/ }));
    expect(pw.type).toBe('text');
    await user.click(screen.getByRole('button', { name: /비밀번호 숨기기/ }));
    expect(pw.type).toBe('password');
  });
});
