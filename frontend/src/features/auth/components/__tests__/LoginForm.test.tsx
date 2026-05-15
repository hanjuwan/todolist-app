import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/lib/api-client';
import { LoginForm } from '../LoginForm';

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
    <MemoryRouter initialEntries={['/login']}>
      <QueryClientProvider client={makeClient()}>
        <LoginForm />
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

describe('LoginForm', () => {
  it('유효하지 않은 이메일 submit 시 이메일 형식 오류를 표시한다', async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('이메일', { exact: false }) ?? screen.getByRole('textbox'), {
      target: { value: 'invalid-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));
    expect(await screen.findByText('이메일 형식이 올바르지 않습니다.')).toBeInTheDocument();
  });

  it('올바른 credentials 입력 후 로그인 성공 시 /todos로 이동한다', async () => {
    mock.onPost('/auth/login').reply(200, {
      success: true,
      data: { accessToken: 'token123', user: { id: '1', email: 'test@example.com', name: '홍길동' } },
    });

    renderForm();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/todos');
    });
  });

  it('서버 401 INVALID_CREDENTIALS 응답 시 오류 메시지 표시 및 password 초기화', async () => {
    mock.onPost('/auth/login').reply(401, {
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: '인증 실패' },
    });

    renderForm();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test@example.com' } });
    const passwordInput = screen.getByLabelText('비밀번호');
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeInTheDocument();
    expect(passwordInput).toHaveValue('');
  });

  it('회원가입 링크 클릭 시 /register로 이동한다', () => {
    renderForm();
    const link = screen.getByRole('link', { name: '회원가입' });
    expect(link).toHaveAttribute('href', '/register');
  });

  it('비밀번호 show/hide 토글 클릭 시 input type이 변경된다', () => {
    renderForm();
    const passwordInput = screen.getByLabelText('비밀번호');
    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: '비밀번호 보기' }));
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: '비밀번호 숨기기' }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
