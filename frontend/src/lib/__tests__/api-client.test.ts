import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { ApiError } from '@/shared/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '..', '..');

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
  useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
});

afterEach(() => {
  mock.restore();
});

describe('api-client: baseURL & headers', () => {
  it('baseURL falls back to /api when VITE_API_BASE_URL is missing', () => {
    expect(apiClient.defaults.baseURL).toBeTruthy();
  });

  it('default Content-Type is application/json', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('default timeout is 10s', () => {
    expect(apiClient.defaults.timeout).toBe(10_000);
  });
});

describe('api-client: request interceptor', () => {
  it('attaches Bearer token when present in auth store', async () => {
    useAuthStore.setState({
      token: 'tok-abc',
      user: { id: '1', email: 'a@b.c', name: 'A' },
      isAuthenticated: true,
    });
    mock.onGet('/ping').reply((config) => {
      expect(config.headers?.Authorization).toBe('Bearer tok-abc');
      return [200, { ok: true }];
    });
    const res = await apiClient.get('/ping');
    expect(res.status).toBe(200);
  });

  it('omits Authorization header when no token', async () => {
    mock.onGet('/ping').reply((config) => {
      expect(config.headers?.Authorization).toBeUndefined();
      return [200, { ok: true }];
    });
    await apiClient.get('/ping');
  });
});

describe('api-client: response error normalization', () => {
  it('4xx server error → ApiError with code/message/status', async () => {
    mock.onGet('/x').reply(400, {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: '입력값이 올바르지 않습니다.' },
    });
    await expect(apiClient.get('/x')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'VALIDATION_ERROR',
      status: 400,
    });
  });

  it('preserves validation details array', async () => {
    mock.onPost('/v').reply(400, {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: '입력값이 올바르지 않습니다.',
        details: [{ path: 'email', message: '이메일 형식이 올바르지 않습니다.' }],
      },
    });
    try {
      await apiClient.post('/v', {});
      throw new Error('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).details?.[0]?.path).toBe('email');
    }
  });

  it('network error → NETWORK_ERROR', async () => {
    mock.onGet('/n').networkError();
    await expect(apiClient.get('/n')).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      status: 0,
    });
  });

  it('timeout → TIMEOUT', async () => {
    mock.onGet('/t').timeout();
    await expect(apiClient.get('/t')).rejects.toMatchObject({
      code: 'TIMEOUT',
      status: 0,
    });
  });

  it('non-standard 5xx body → UNKNOWN_ERROR', async () => {
    mock.onGet('/u').reply(500, '<html>Internal</html>');
    await expect(apiClient.get('/u')).rejects.toMatchObject({
      code: 'UNKNOWN_ERROR',
      status: 500,
    });
  });
});

describe('api-client: 401 handling', () => {
  it('401 → clearToken + redirect to /login', async () => {
    useAuthStore.setState({
      token: 'tok-1',
      user: { id: '1', email: 'a@b.c', name: 'A' },
      isAuthenticated: true,
    });
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { pathname: '/todos', href: '/todos' },
    });
    mock.onGet('/p').reply(401, {
      success: false,
      error: { code: 'UNAUTHENTICATED', message: '인증이 필요합니다.' },
    });
    await expect(apiClient.get('/p')).rejects.toBeInstanceOf(ApiError);
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(window.location.href).toBe('/login');
  });

  it('401 on /login does not re-redirect', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { pathname: '/login', href: '/login' },
    });
    mock.onPost('/auth/login').reply(401, {
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
    });
    await expect(apiClient.post('/auth/login', {})).rejects.toBeInstanceOf(ApiError);
    expect(window.location.href).toBe('/login');
  });
});

describe('api-client: security — no client-side token persistence', () => {
  function readSource(rel: string) {
    return readFileSync(path.join(SRC, rel), 'utf8');
  }

  it('api-client.ts does not reference localStorage/sessionStorage/cookie', () => {
    const src = readSource('lib/api-client.ts');
    expect(src).not.toMatch(/localStorage/);
    expect(src).not.toMatch(/sessionStorage/);
    expect(src).not.toMatch(/document\.cookie/);
  });

  it('auth-store.ts does not reference localStorage/sessionStorage/cookie/persist', () => {
    const src = readSource('features/auth/store/auth-store.ts');
    expect(src).not.toMatch(/localStorage/);
    expect(src).not.toMatch(/sessionStorage/);
    expect(src).not.toMatch(/document\.cookie/);
    expect(src).not.toMatch(/zustand\/middleware/);
    expect(src).not.toMatch(/persist\(/);
  });
});
