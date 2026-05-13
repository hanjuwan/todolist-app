import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { ApiError } from '@/shared/types';

const SAMPLE_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'a@b.c',
  name: 'tester',
  createdAt: '2026-05-13T00:00:00Z',
  updatedAt: '2026-05-13T00:00:00Z',
};

describe('api-client', () => {
  let mock: MockAdapter;
  const originalLocation = window.location;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    useAuthStore.getState().clearToken();
    // jsdom/happy-dom: replace location for redirect assertion
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, pathname: '/todos', href: '/todos' },
      writable: true,
    });
  });

  afterEach(() => {
    mock.restore();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
      writable: true,
    });
  });

  it('baseURL이 VITE_API_BASE_URL을 사용한다', () => {
    expect(apiClient.defaults.baseURL).toBe(import.meta.env.VITE_API_BASE_URL ?? '/api');
  });

  it('요청 인터셉터: token이 있으면 Authorization 헤더에 Bearer 부착', async () => {
    useAuthStore.getState().setToken('test-jwt', SAMPLE_USER);
    mock.onGet('/users/me').reply((config) => {
      expect(config.headers?.Authorization).toBe('Bearer test-jwt');
      return [200, SAMPLE_USER];
    });

    const res = await apiClient.get('/users/me');
    expect(res.status).toBe(200);
  });

  it('요청 인터셉터: token이 없으면 Authorization 헤더 없음', async () => {
    mock.onGet('/health').reply((config) => {
      expect(config.headers?.Authorization).toBeUndefined();
      return [200, { ok: true }];
    });
    await apiClient.get('/health');
  });

  it('에러 응답을 ApiError로 정규화한다 (백엔드 에러 스키마)', async () => {
    mock.onPost('/auth/register').reply(409, {
      success: false,
      error: { code: 'EMAIL_DUPLICATED', message: '이미 사용 중인 이메일' },
    });

    await expect(apiClient.post('/auth/register', {})).rejects.toMatchObject({
      status: 409,
      code: 'EMAIL_DUPLICATED',
      message: '이미 사용 중인 이메일',
    });
  });

  it('검증 에러의 details 배열을 보존한다', async () => {
    mock.onPost('/auth/login').reply(400, {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: '입력값이 올바르지 않습니다.',
        details: [{ path: 'email', message: 'invalid' }],
      },
    });

    try {
      await apiClient.post('/auth/login', {});
      throw new Error('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      const err = e as ApiError;
      expect(err.details).toEqual([{ path: 'email', message: 'invalid' }]);
    }
  });

  it('401 응답 시 토큰을 clear하고 /login으로 리다이렉트', async () => {
    useAuthStore.getState().setToken('expired-jwt', SAMPLE_USER);
    mock.onGet('/users/me').reply(401, {
      success: false,
      error: { code: 'UNAUTHENTICATED', message: '인증이 필요합니다.' },
    });

    await expect(apiClient.get('/users/me')).rejects.toBeInstanceOf(ApiError);
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(window.location.href).toBe('/login');
  });

  it('이미 /login 페이지에 있으면 리다이렉트 반복 없음', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, pathname: '/login', href: '/login' },
      writable: true,
    });
    useAuthStore.getState().setToken('x', SAMPLE_USER);
    mock.onGet('/auth/something').reply(401, {
      success: false,
      error: { code: 'UNAUTHENTICATED', message: '...' },
    });

    await expect(apiClient.get('/auth/something')).rejects.toBeInstanceOf(ApiError);
    expect(window.location.href).toBe('/login');
  });

  it('네트워크 에러는 NETWORK_ERROR로 정규화', async () => {
    mock.onGet('/health').networkError();
    await expect(apiClient.get('/health')).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK_ERROR',
    });
  });

  it('타임아웃은 TIMEOUT으로 정규화', async () => {
    mock.onGet('/health').timeout();
    await expect(apiClient.get('/health')).rejects.toMatchObject({
      status: 0,
      code: 'TIMEOUT',
    });
  });

  it('비표준 에러 응답도 ApiError로 처리(UNKNOWN_ERROR)', async () => {
    mock.onGet('/x').reply(500, '<html>Internal Server Error</html>');
    await expect(apiClient.get('/x')).rejects.toMatchObject({
      status: 500,
      code: 'UNKNOWN_ERROR',
    });
  });
});

describe('api-client: 보안 — 토큰 영속화 금지', () => {
  it('api-client.ts 소스에 localStorage/sessionStorage/document.cookie 접근 코드가 없다', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const src = readFileSync(
      path.resolve(__dirname, '..', 'api-client.ts'),
      'utf-8',
    );
    expect(src).not.toMatch(/localStorage/);
    expect(src).not.toMatch(/sessionStorage/);
    expect(src).not.toMatch(/document\.cookie/);
  });

  it('auth-store.ts에 persist 미들웨어 사용이 없다', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const src = readFileSync(
      path.resolve(__dirname, '..', '..', 'features', 'auth', 'store', 'auth-store.ts'),
      'utf-8',
    );
    expect(src).not.toMatch(/persist/);
    expect(src).not.toMatch(/localStorage/);
  });
});
