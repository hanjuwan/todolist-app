import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import RegisterForm from '@/features/auth/components/RegisterForm';
import { apiClient } from '@/lib/api-client';

function LoginStub() {
  const loc = useLocation();
  const state = loc.state as { registered?: boolean } | null;
  return (
    <div data-testid="page-login">
      {state?.registered ? <span data-testid="banner">회원가입이 완료되었습니다.</span> : null}
    </div>
  );
}

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginStub />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function fill(values: { email: string; name: string; password: string; passwordConfirm: string }) {
  const user = userEvent.setup();
  setup();
  await user.type(screen.getByLabelText('이름'), values.name);
  await user.type(screen.getByLabelText('이메일'), values.email);
  await user.type(screen.getByLabelText('비밀번호', { exact: true }), values.password);
  await user.type(screen.getByLabelText('비밀번호 확인'), values.passwordConfirm);
  return user;
}

describe('RegisterForm', () => {
  let mock: MockAdapter;
  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });
  afterEach(() => mock.restore());

  it('비밀번호 불일치 시 실시간 인라인 오류', async () => {
    await fill({ email: 'a@b.co', name: '홍길동', password: 'pw12345!', passwordConfirm: 'different' });
    expect(await screen.findByText(/비밀번호가 일치하지 않습니다/)).toBeTruthy();
  });

  it('비밀번호 8자 미만 실시간 검증', async () => {
    await fill({ email: 'a@b.co', name: '홍길동', password: '1234', passwordConfirm: '1234' });
    expect(await screen.findByText(/8자 이상/)).toBeTruthy();
  });

  it('가입 성공 시 /login으로 이동 + 안내 배너', async () => {
    mock.onPost('/auth/register').reply(201, {
      id: 'u-1',
      email: 'a@b.co',
      name: '홍길동',
      createdAt: 'x',
      updatedAt: 'x',
    });
    const user = await fill({
      email: 'a@b.co',
      name: '홍길동',
      password: 'pw12345!',
      passwordConfirm: 'pw12345!',
    });
    await user.click(screen.getByRole('button', { name: /가입하기/ }));
    await waitFor(() => expect(screen.getByTestId('page-login')).toBeTruthy());
    expect(screen.getByTestId('banner')).toBeTruthy();
  });

  it('중복 이메일(409) 시 이메일 필드 인라인 오류', async () => {
    mock.onPost('/auth/register').reply(409, {
      success: false,
      error: { code: 'EMAIL_DUPLICATED', message: 'dup' },
    });
    const user = await fill({
      email: 'dup@b.co',
      name: '홍길동',
      password: 'pw12345!',
      passwordConfirm: 'pw12345!',
    });
    await user.click(screen.getByRole('button', { name: /가입하기/ }));
    expect(await screen.findByText(/이미 사용 중인 이메일/)).toBeTruthy();
  });

  it('비밀번호 show/hide 토글', async () => {
    const user = userEvent.setup();
    setup();
    const pw = screen.getByLabelText('비밀번호', { exact: true }) as HTMLInputElement;
    expect(pw.type).toBe('password');
    const toggle = screen.getAllByRole('button', { name: /비밀번호 보기/ })[0];
    await user.click(toggle);
    expect(pw.type).toBe('text');
  });
});
