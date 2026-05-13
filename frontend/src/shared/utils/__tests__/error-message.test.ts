import { describe, it, expect } from 'vitest';
import { toUserMessage, toFieldMessage } from '@/shared/utils/error-message';
import { ApiError } from '@/shared/types';

describe('toUserMessage', () => {
  it('알려진 코드 → 친화 문구 (HTTP status 미노출)', () => {
    const msg = toUserMessage(new ApiError(401, 'INVALID_CREDENTIALS', 'raw'));
    expect(msg).toBe('이메일 또는 비밀번호가 올바르지 않습니다.');
    expect(msg).not.toMatch(/401|raw/);
  });

  it('카테고리 코드 매핑', () => {
    expect(toUserMessage(new ApiError(409, 'CATEGORY_NAME_DUPLICATED', 'dup'))).toMatch(
      /이미 사용 중인 카테고리명/,
    );
    expect(toUserMessage(new ApiError(409, 'CATEGORY_HAS_TODOS', 'x'))).toMatch(
      /연결된 할일/,
    );
    expect(toUserMessage(new ApiError(403, 'CATEGORY_DEFAULT_IMMUTABLE', 'x'))).toMatch(
      /기본 카테고리/,
    );
  });

  it('네트워크/타임아웃/알 수 없는 에러는 공통 안내', () => {
    expect(toUserMessage(new ApiError(0, 'NETWORK_ERROR', 'x'))).toMatch(/네트워크/);
    expect(toUserMessage(new ApiError(0, 'TIMEOUT', 'x'))).toMatch(/시간이 초과/);
    expect(toUserMessage(new ApiError(500, 'UNKNOWN_ERROR', 'x'))).toMatch(/일시적인 오류/);
  });

  it('매핑되지 않은 코드는 fallback', () => {
    expect(toUserMessage(new ApiError(500, 'SOME_UNKNOWN_CODE', 'x'))).toMatch(/일시적인 오류/);
  });

  it('비-ApiError(plain object with code) 처리', () => {
    expect(toUserMessage({ code: 'EMAIL_DUPLICATED' })).toMatch(/이미 사용 중인 이메일/);
  });

  it('null/undefined/Error → fallback', () => {
    expect(toUserMessage(null)).toMatch(/일시적인 오류/);
    expect(toUserMessage(undefined)).toMatch(/일시적인 오류/);
    expect(toUserMessage(new Error('raw'))).toMatch(/일시적인 오류/);
  });

  it('HTTP 상태 코드 숫자가 절대 노출되지 않음', () => {
    for (const code of [
      'EMAIL_DUPLICATED',
      'INVALID_CREDENTIALS',
      'VALIDATION_ERROR',
      'CATEGORY_HAS_TODOS',
      'NETWORK_ERROR',
      'UNKNOWN_ERROR',
    ]) {
      const msg = toUserMessage(new ApiError(500, code, 'raw'));
      expect(msg).not.toMatch(/\b\d{3}\b/);
    }
  });
});

describe('toFieldMessage', () => {
  it('details에서 해당 필드 메시지 반환', () => {
    const err = new ApiError(400, 'VALIDATION_ERROR', 'bad', [
      { path: 'email', message: '이메일 형식이 올바르지 않습니다.' },
      { path: 'password', message: '비밀번호는 8자 이상' },
    ]);
    expect(toFieldMessage(err, 'email')).toBe('이메일 형식이 올바르지 않습니다.');
    expect(toFieldMessage(err, 'password')).toBe('비밀번호는 8자 이상');
  });

  it('필드가 없으면 null', () => {
    const err = new ApiError(400, 'VALIDATION_ERROR', 'bad', [
      { path: 'email', message: 'x' },
    ]);
    expect(toFieldMessage(err, 'name')).toBeNull();
  });

  it('ApiError가 아니거나 details가 없으면 null', () => {
    expect(toFieldMessage(new Error('x'), 'email')).toBeNull();
    expect(toFieldMessage(new ApiError(400, 'X', 'x'), 'email')).toBeNull();
  });
});

describe('CSS 변수 / 색상 하드코딩 금지 정적 검증', () => {
  it('global.css에 색상 변수가 정의되어 있다', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const css = readFileSync(
      path.resolve(__dirname, '..', '..', '..', 'styles', 'global.css'),
      'utf-8',
    );
    expect(css).toMatch(/--color-bg:/);
    expect(css).toMatch(/--color-text:/);
    expect(css).toMatch(/--color-primary:/);
    expect(css).toMatch(/--color-danger:/);
    expect(css).toMatch(/--touch-target-min:\s*44px/);
  });

  it('global.css에 3개 breakpoint 미디어쿼리가 있다', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const css = readFileSync(
      path.resolve(__dirname, '..', '..', '..', 'styles', 'global.css'),
      'utf-8',
    );
    expect(css).toMatch(/@media\s*\(max-width:\s*767px\)/);
    expect(css).toMatch(/@media\s*\(min-width:\s*768px\)\s*and\s*\(max-width:\s*1023px\)/);
    expect(css).toMatch(/@media\s*\(min-width:\s*1024px\)/);
  });
});
