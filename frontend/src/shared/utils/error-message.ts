import { ApiError } from '@/shared/types';

/**
 * 백엔드 error.code → 사용자 친화 한국어 문구 매핑.
 * 기술적 코드/HTTP 상태는 화면에 노출하지 않는다 (PRD 9.3, SCN-11/15).
 */
const CODE_MESSAGES: Record<string, string> = {
  // Auth
  EMAIL_DUPLICATED: '이미 사용 중인 이메일입니다.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  INVALID_CURRENT_PASSWORD: '현재 비밀번호가 올바르지 않습니다.',
  UNAUTHENTICATED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',

  // Validation
  VALIDATION_ERROR: '입력값을 다시 확인해 주세요.',

  // User
  USER_NOT_FOUND: '사용자 정보를 찾을 수 없습니다.',

  // Todo
  TODO_NOT_FOUND: '할일을 찾을 수 없습니다.',

  // Category
  CATEGORY_NOT_FOUND: '카테고리를 찾을 수 없습니다.',
  CATEGORY_NAME_DUPLICATED: '이미 사용 중인 카테고리명입니다.',
  CATEGORY_HAS_TODOS: '이 카테고리에 연결된 할일이 있어 삭제할 수 없습니다.',
  CATEGORY_DEFAULT_IMMUTABLE: '기본 카테고리는 변경할 수 없습니다.',

  // Network / Client
  NETWORK_ERROR: '네트워크에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.',
  TIMEOUT: '요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.',
  UNKNOWN_ERROR: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
};

const FALLBACK = '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';

/** ApiError(또는 알 수 없는 에러)를 사용자 친화 문구로 변환. HTTP status는 노출하지 않는다. */
export function toUserMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return CODE_MESSAGES[err.code] ?? FALLBACK;
  }
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: string }).code;
    return CODE_MESSAGES[code] ?? FALLBACK;
  }
  return FALLBACK;
}

/** 첫 번째 필드 에러 메시지를 친화 문구로 변환 (서버 zod details 우선) */
export function toFieldMessage(err: unknown, field: string): string | null {
  if (err instanceof ApiError && err.details) {
    const detail = err.details.find((d) => d.path === field);
    if (detail) return detail.message;
  }
  return null;
}
