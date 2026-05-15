import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { AppRoutes } from '@/routes';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { apiClient } from '@/lib/api-client';

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
  mock.onGet('/users/me').reply(200, {
    success: true,
    data: { id: 'u', email: 'a@b.c', name: 'A', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  });
});

afterEach(() => {
  mock.restore();
});

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

function renderAt(path: string) {
  return render(
    <QueryClientProvider client={makeClient()}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function login() {
  useAuthStore.setState({
    token: 'tok',
    user: { id: 'u', email: 'a@b.c', name: 'A' },
    isAuthenticated: true,
  });
}

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
});

describe('비로그인 상태 라우팅', () => {
  it('/todos 접근 → /login 리다이렉트', () => {
    renderAt('/todos');
    expect(screen.getByTestId('login-page')).toBeTruthy();
  });

  it('/categories 접근 → /login 리다이렉트', () => {
    renderAt('/categories');
    expect(screen.getByTestId('login-page')).toBeTruthy();
  });

  it('/mypage 접근 → /login 리다이렉트', () => {
    renderAt('/mypage');
    expect(screen.getByTestId('login-page')).toBeTruthy();
  });

  it('/login 정상 노출', () => {
    renderAt('/login');
    expect(screen.getByTestId('login-page')).toBeTruthy();
  });

  it('/register 정상 노출', () => {
    renderAt('/register');
    expect(screen.getByTestId('register-page')).toBeTruthy();
  });

  it('/ 폴백 → /login (비로그인이므로 /todos→/login)', () => {
    renderAt('/');
    expect(screen.getByTestId('login-page')).toBeTruthy();
  });

  it('미정의 경로(*)도 /login 으로 폴백 (비로그인이므로 /todos→/login)', () => {
    renderAt('/does-not-exist');
    expect(screen.getByTestId('login-page')).toBeTruthy();
  });
});

describe('로그인 상태 라우팅', () => {
  beforeEach(() => login());

  it('/login → /todos 리다이렉트', () => {
    renderAt('/login');
    expect(screen.getByTestId('todos-page')).toBeTruthy();
  });

  it('/register → /todos 리다이렉트', () => {
    renderAt('/register');
    expect(screen.getByTestId('todos-page')).toBeTruthy();
  });

  it('/todos 정상 렌더', () => {
    renderAt('/todos');
    expect(screen.getByTestId('todos-page')).toBeTruthy();
  });

  it('/categories 정상 렌더', () => {
    renderAt('/categories');
    expect(screen.getByTestId('categories-page')).toBeTruthy();
  });

  it('/mypage 정상 렌더', () => {
    renderAt('/mypage');
    expect(screen.getByTestId('mypage')).toBeTruthy();
  });

  it('/ 폴백 → /todos', () => {
    renderAt('/');
    expect(screen.getByTestId('todos-page')).toBeTruthy();
  });

  it('미정의 경로 → /todos 폴백', () => {
    renderAt('/some/unknown/path');
    expect(screen.getByTestId('todos-page')).toBeTruthy();
  });
});
