import { describe, it, expect } from 'vitest';
import { toUserMessage, toFieldMessage } from '../error-message';
import { ApiError } from '@/shared/types';

describe('toUserMessage', () => {
  it('EMAIL_DUPLICATED → 친화 메시지', () => {
    const err = new ApiError({ code: 'EMAIL_DUPLICATED', message: 'srv', status: 409 });
    expect(toUserMessage(err)).toBe('이미 사용 중인 이메일입니다.');
  });

  it('INVALID_CREDENTIALS → 친화 메시지', () => {
    const err = new ApiError({ code: 'INVALID_CREDENTIALS', message: 'srv', status: 401 });
    expect(toUserMessage(err)).toBe('이메일 또는 비밀번호가 올바르지 않습니다.');
  });

  it('INVALID_CURRENT_PASSWORD → 친화 메시지', () => {
    const err = new ApiError({ code: 'INVALID_CURRENT_PASSWORD', message: 'srv', status: 400 });
    expect(toUserMessage(err)).toBe('현재 비밀번호가 올바르지 않습니다.');
  });

  it('CATEGORY_HAS_TODOS → 친화 메시지', () => {
    const err = new ApiError({ code: 'CATEGORY_HAS_TODOS', message: 'srv', status: 409 });
    expect(toUserMessage(err)).toBe('이 카테고리에 연결된 할일이 있어 삭제할 수 없습니다.');
  });

  it('CATEGORY_NAME_DUPLICATED → 친화 메시지', () => {
    const err = new ApiError({ code: 'CATEGORY_NAME_DUPLICATED', message: 'srv', status: 409 });
    expect(toUserMessage(err)).toBe('이미 사용 중인 카테고리 이름입니다.');
  });

  it('NETWORK_ERROR → 재시도 메시지', () => {
    const err = new ApiError({ code: 'NETWORK_ERROR', message: 'srv', status: 0 });
    expect(toUserMessage(err)).toBe('잠시 후 다시 시도해 주세요.');
  });

  it('TIMEOUT → 재시도 메시지', () => {
    const err = new ApiError({ code: 'TIMEOUT', message: 'srv', status: 0 });
    expect(toUserMessage(err)).toBe('잠시 후 다시 시도해 주세요.');
  });

  it('알 수 없는 코드 → fallback 메시지', () => {
    const err = new ApiError({ code: 'UNKNOWN_CODE', message: 'srv', status: 500 });
    expect(toUserMessage(err)).toBe('처리 중 오류가 발생했습니다.');
  });

  it('plain object { code } → 매핑된 메시지', () => {
    expect(toUserMessage({ code: 'EMAIL_DUPLICATED' })).toBe('이미 사용 중인 이메일입니다.');
  });

  it('null/undefined → fallback 메시지', () => {
    expect(toUserMessage(null)).toBe('처리 중 오류가 발생했습니다.');
    expect(toUserMessage(undefined)).toBe('처리 중 오류가 발생했습니다.');
  });

  it('HTTP 상태 코드(3자리 숫자) 미노출 검증', () => {
    const codes = [
      'EMAIL_DUPLICATED', 'INVALID_CREDENTIALS', 'INVALID_CURRENT_PASSWORD',
      'CATEGORY_HAS_TODOS', 'CATEGORY_NAME_DUPLICATED', 'CATEGORY_DEFAULT_IMMUTABLE',
      'VALIDATION_ERROR', 'UNAUTHENTICATED', 'NETWORK_ERROR', 'TIMEOUT',
      'TODO_NOT_FOUND', 'CATEGORY_NOT_FOUND', 'USER_NOT_FOUND',
    ];
    for (const code of codes) {
      const msg = toUserMessage(new ApiError({ code, message: '', status: 0 }));
      expect(msg).not.toMatch(/\d{3}/);
    }
  });
});

describe('toFieldMessage', () => {
  it('details에 fieldPath 매칭 시 해당 message 반환', () => {
    const err = new ApiError({
      code: 'VALIDATION_ERROR',
      message: 'srv',
      status: 400,
      details: [
        { path: 'email', message: '이메일 형식이 올바르지 않습니다.' },
        { path: 'password', message: '비밀번호는 8자 이상이어야 합니다.' },
      ],
    });
    expect(toFieldMessage(err, 'email')).toBe('이메일 형식이 올바르지 않습니다.');
    expect(toFieldMessage(err, 'password')).toBe('비밀번호는 8자 이상이어야 합니다.');
  });
});
