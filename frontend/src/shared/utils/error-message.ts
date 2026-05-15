import { ApiError } from '@/shared/types';

const CODE_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: '입력 정보를 확인해 주세요.',
  UNAUTHENTICATED: '로그인이 필요합니다.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  INVALID_CURRENT_PASSWORD: '현재 비밀번호가 올바르지 않습니다.',
  EMAIL_DUPLICATED: '이미 사용 중인 이메일입니다.',
  CATEGORY_DEFAULT_IMMUTABLE: '기본 카테고리는 변경할 수 없습니다.',
  CATEGORY_NAME_DUPLICATED: '이미 사용 중인 카테고리 이름입니다.',
  CATEGORY_HAS_TODOS: '이 카테고리에 연결된 할일이 있어 삭제할 수 없습니다.',
  TODO_NOT_FOUND: '할일을 찾을 수 없습니다.',
  CATEGORY_NOT_FOUND: '카테고리를 찾을 수 없습니다.',
  USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
  NETWORK_ERROR: '잠시 후 다시 시도해 주세요.',
  TIMEOUT: '잠시 후 다시 시도해 주세요.',
};

const DEFAULT_MESSAGE = '처리 중 오류가 발생했습니다.';

export function toUserMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return CODE_MESSAGES[err.code] ?? DEFAULT_MESSAGE;
  }
  if (err && typeof err === 'object' && 'code' in err && typeof (err as { code: unknown }).code === 'string') {
    return CODE_MESSAGES[(err as { code: string }).code] ?? DEFAULT_MESSAGE;
  }
  return DEFAULT_MESSAGE;
}

export function toFieldMessage(err: unknown, fieldPath: string): string | undefined {
  if (err instanceof ApiError && err.details) {
    const issue = err.details.find((d) => d.path === fieldPath);
    return issue?.message;
  }
  return undefined;
}
