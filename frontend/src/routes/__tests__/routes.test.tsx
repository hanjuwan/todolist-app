import { describe, it, expect, beforeEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach as _afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/lib/api-client';
import AppRoutes from '@/routes';
import { useAuthStore } from '@/features/auth/store/auth-store';

let mock: MockAdapter;
beforeEach(() => {
  mock = new MockAdapter(apiClient);
  mock.onAny().reply(200, []);
});
_afterEach(() => {
  mock.restore();
});

const USER = {
  id: 'u-1',
  email: 'a@b.c',
  name: 'tester',
  createdAt: '2026-05-13T00:00:00Z',
  updatedAt: '2026-05-13T00:00:00Z',
};

function renderAt(path: string) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AppRoutes — Protected / PublicOnly', () => {
  beforeEach(() => {
    useAuthStore.getState().clearToken();
  });

  it('비로그인 + /todos → /login으로 리다이렉트', () => {
    renderAt('/todos');
    expect(screen.getByTestId('page-login')).toBeTruthy();
  });

  it('비로그인 + /categories → /login으로 리다이렉트', () => {
    renderAt('/categories');
    expect(screen.getByTestId('page-login')).toBeTruthy();
  });

  it('비로그인 + /mypage → /login으로 리다이렉트', () => {
    renderAt('/mypage');
    expect(screen.getByTestId('page-login')).toBeTruthy();
  });

  it('비로그인 + /login → 로그인 페이지 렌더', () => {
    renderAt('/login');
    expect(screen.getByTestId('page-login')).toBeTruthy();
  });

  it('비로그인 + /register → 회원가입 페이지 렌더', () => {
    renderAt('/register');
    expect(screen.getByTestId('page-register')).toBeTruthy();
  });

  it('로그인 + /login → /todos로 리다이렉트', () => {
    useAuthStore.getState().setToken('jwt-x', USER);
    renderAt('/login');
    expect(screen.getByTestId('page-todos')).toBeTruthy();
  });

  it('로그인 + /register → /todos로 리다이렉트', () => {
    useAuthStore.getState().setToken('jwt-x', USER);
    renderAt('/register');
    expect(screen.getByTestId('page-todos')).toBeTruthy();
  });

  it('로그인 + /todos → 할일 목록 렌더', () => {
    useAuthStore.getState().setToken('jwt-x', USER);
    renderAt('/todos');
    expect(screen.getByTestId('page-todos')).toBeTruthy();
  });

  it('로그인 + /categories → 카테고리 렌더', () => {
    useAuthStore.getState().setToken('jwt-x', USER);
    renderAt('/categories');
    expect(screen.getByTestId('page-categories')).toBeTruthy();
  });

  it('로그인 + /mypage → 마이페이지 렌더', () => {
    useAuthStore.getState().setToken('jwt-x', USER);
    renderAt('/mypage');
    expect(screen.getByTestId('page-mypage')).toBeTruthy();
  });

  it('루트 / → 비로그인 시 /login', () => {
    renderAt('/');
    expect(screen.getByTestId('page-login')).toBeTruthy();
  });

  it('루트 / → 로그인 시 /todos', () => {
    useAuthStore.getState().setToken('jwt-x', USER);
    renderAt('/');
    expect(screen.getByTestId('page-todos')).toBeTruthy();
    cleanup();
  });

  it('정의되지 않은 경로 → /todos 폴백 (비로그인 시 /login으로 다시 리다이렉트)', () => {
    renderAt('/no-such-path');
    expect(screen.getByTestId('page-login')).toBeTruthy();
  });
});
