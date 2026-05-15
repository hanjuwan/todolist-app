import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
  localStorage.clear();
  sessionStorage.clear();
});

describe('useAuthStore', () => {
  it('초기 상태는 비로그인이다', () => {
    const s = useAuthStore.getState();
    expect(s.token).toBeNull();
    expect(s.user).toBeNull();
    expect(s.isAuthenticated).toBe(false);
  });

  it('setToken은 토큰·사용자·isAuthenticated=true 를 설정한다', () => {
    useAuthStore.getState().setToken('tok-1', { id: 'u1', email: 'a@b.c', name: 'A' });
    const s = useAuthStore.getState();
    expect(s.token).toBe('tok-1');
    expect(s.user).toEqual({ id: 'u1', email: 'a@b.c', name: 'A' });
    expect(s.isAuthenticated).toBe(true);
  });

  it('clearToken은 토큰·사용자를 초기화하고 isAuthenticated=false 로 만든다', () => {
    useAuthStore.getState().setToken('tok-2', { id: 'u2', email: 'b@c.d', name: 'B' });
    useAuthStore.getState().clearToken();
    const s = useAuthStore.getState();
    expect(s.token).toBeNull();
    expect(s.user).toBeNull();
    expect(s.isAuthenticated).toBe(false);
  });

  it('setToken 호출 후 localStorage/sessionStorage에 토큰이 저장되지 않는다 (persist 미들웨어 미사용)', () => {
    useAuthStore.getState().setToken('tok-persist-check', { id: 'u', email: 'e@e.e', name: 'E' });
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });
});
