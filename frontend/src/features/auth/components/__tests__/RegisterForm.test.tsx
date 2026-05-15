import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/lib/api-client';
import { RegisterForm } from '../RegisterForm';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

function renderForm() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <QueryClientProvider client={makeClient()}>
        <RegisterForm />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.reset();
  mockNavigate.mockReset();
});

function fillForm(overrides: Partial<{ name: string; email: string; password: string; passwordConfirm: string }> = {}) {
  const values = {
    name: '홍길동',
    email: 'test@example.com',
    password: 'password123',
    passwordConfirm: 'password123',
    ...overrides,
  };
  fireEvent.change(screen.getByLabelText('이름', { exact: false }), { target: { value: values.name } });
  fireEvent.change(screen.getByRole('textbox', { name: /이메일/ }), { target: { value: values.email } });
  fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: values.password } });
  fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: values.passwordConfirm } });
}

describe('RegisterForm', () => {
  it('비밀번호 8자 미만 입력 후 submit 시 오류 메시지를 표시한다', async () => {
    renderForm();
    fillForm({ password: 'short', passwordConfirm: 'short' });
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));
    expect(await screen.findByText('비밀번호는 8자 이상이어야 합니다.')).toBeInTheDocument();
  });

  it('비밀번호 불일치 입력 후 submit 시 오류 메시지를 표시한다', async () => {
    renderForm();
    fillForm({ password: 'password123', passwordConfirm: 'different' });
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));
    expect(await screen.findByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument();
  });

  it('올바른 데이터 submit 성공 시 /login으로 navigate를 호출한다', async () => {
    mock.onPost('/auth/register').reply(201, {
      success: true,
      data: { id: '1', email: 'test@example.com', name: '홍길동', createdAt: '', updatedAt: '' },
    });

    renderForm();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { registered: true } });
    });
  });

  it('409 EMAIL_DUPLICATED 응답 시 이메일 필드 하단에 오류 메시지를 표시한다', async () => {
    mock.onPost('/auth/register').reply(409, {
      success: false,
      error: { code: 'EMAIL_DUPLICATED', message: '이메일 중복' },
    });

    renderForm();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    expect(await screen.findByText('이미 사용 중인 이메일입니다.')).toBeInTheDocument();
  });

  it('비밀번호 show/hide 토글 클릭 시 input type이 변경된다', () => {
    renderForm();
    const passwordInput = screen.getByLabelText('비밀번호');
    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getAllByRole('button', { name: '비밀번호 보기' })[0]);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getAllByRole('button', { name: '비밀번호 숨기기' })[0]);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
