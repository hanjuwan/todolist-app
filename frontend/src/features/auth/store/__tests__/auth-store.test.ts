import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';

const USER = {
  id: 'u-1',
  email: 'a@b.c',
  name: 'tester',
  createdAt: '2026-05-13T00:00:00Z',
  updatedAt: '2026-05-13T00:00:00Z',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clearToken();
  });

  it('초기 상태: 비로그인', () => {
    const s = useAuthStore.getState();
    expect(s.token).toBeNull();
    expect(s.user).toBeNull();
    expect(s.isAuthenticated).toBe(false);
  });

  it('setToken: 토큰·유저 설정 + isAuthenticated=true', () => {
    useAuthStore.getState().setToken('jwt-x', USER);
    const s = useAuthStore.getState();
    expect(s.token).toBe('jwt-x');
    expect(s.user).toEqual(USER);
    expect(s.isAuthenticated).toBe(true);
  });

  it('clearToken: 모두 초기화', () => {
    useAuthStore.getState().setToken('jwt-x', USER);
    useAuthStore.getState().clearToken();
    const s = useAuthStore.getState();
    expect(s.token).toBeNull();
    expect(s.user).toBeNull();
    expect(s.isAuthenticated).toBe(false);
  });

  it('영속화 금지: localStorage/sessionStorage에 토큰이 저장되지 않는다 (메모리 휘발)', () => {
    useAuthStore.getState().setToken('jwt-x', USER);
    const all = JSON.stringify({
      ls: { ...localStorage },
      ss: { ...sessionStorage },
    });
    expect(all).not.toMatch(/jwt-x/);
  });
});
