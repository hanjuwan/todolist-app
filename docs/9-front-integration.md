# 프론트엔드 통합 가이드 (Frontend Integration Guide)

| 항목 | 내용 |
|------|------|
| **버전** | 1.0 |
| **작성일** | 2026-05-14 |
| **대상 백엔드 버전** | TodoListApp Backend v1.0.0 |
| **기반 문서** | `swagger/swagger.json`, `docs/3-user-scenario.md` |

본 문서는 TodoListApp 프론트엔드(React 19 + Vite + TanStack Query + Zustand)가 백엔드 REST API와 통합되는 방식을 정리한 실무 가이드이다. **실제 백엔드 코드 동작을 기준**으로 작성되었으며, swagger.json과 함께 사용한다.

---

## 1. 서버 베이스 URL

| 항목 | 값 |
|------|---|
| 개발 서버 | `http://localhost:3000` |
| API Base | `http://localhost:3000/api` |
| Swagger UI | `http://localhost:3000/api/docs` |
| Swagger JSON | `http://localhost:3000/api/docs/swagger.json` |
| Health | `GET /api/health` (인증 불요) |

프론트엔드는 `frontend/.env`의 `VITE_API_BASE_URL`로 베이스를 주입한다 (기본값 `http://localhost:3000/api`).

---

## 2. 공통 약속

### 2.1 요청·응답 컨벤션
- 요청 본문·응답 본문은 모두 **camelCase** JSON.
- 성공 응답: `{ "success": true, "data": ... }` (목록은 `{ "success": true, "data": [...], "pagination": {...} }`).
- 실패 응답: `{ "success": false, "error": { "code": "...", "message": "...", "details"?: ... } }`.
- 204 No Content 응답(할일 삭제, 회원 탈퇴, 카테고리 삭제)에는 본문이 없다.

### 2.2 인증
- 모든 보호 API는 헤더 `Authorization: Bearer <accessToken>` 필요.
- `accessToken`은 `POST /api/auth/login` 응답의 `data.accessToken`에서 얻는다.
- 토큰 유효기간 **1시간** (백엔드 `JWT_ACCESS_TOKEN_TTL=1h`).
- 클라이언트는 토큰을 **Zustand 인메모리 스토어(`useAuthStore`)에만 저장**하며 `localStorage`/`sessionStorage`/`Cookie`에 보관하지 않는다 (SCN-01 정책). 새로고침 시 토큰이 휘발되어 재로그인이 필요하다.

### 2.3 CORS
- 백엔드 `CORS_ORIGIN`은 기본 `http://localhost:5173`(Vite 기본 포트). 프론트 dev 서버 포트를 변경할 경우 백엔드 `.env`도 함께 수정.
- `credentials: false` — 쿠키 인증을 사용하지 않으므로 fetch/axios에서도 `withCredentials`를 켜지 않는다.

---

## 3. axios 인스턴스 설정 예시

```ts
// src/lib/api.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.error?.code;
    if (status === 401 && code === 'UNAUTHENTICATED') {
      useAuthStore.getState().clear();
      // 라우터로 SCR-01 이동 — useRouter().navigate('/login')
    }
    return Promise.reject(error);
  },
);
```

---

## 4. 엔드포인트 매핑 (요약)

자세한 스키마·예시는 `swagger.json` 또는 `/api/docs`에서 확인.

### 4.1 Auth (`/api/auth`)
| Method | Path | 인증 | 요청 본문 | 성공 |
|--------|------|------|----------|------|
| POST | `/register` | ✕ | `{ email, password, name }` | 201 `{ data: User }` |
| POST | `/login` | ✕ | `{ email, password }` | 200 `{ data: { accessToken, user } }` |
| POST | `/logout` | ✓ | — | 200 `{ success: true }` |

### 4.2 Users (`/api/users`)
| Method | Path | 인증 | 요청 본문 | 성공 |
|--------|------|------|----------|------|
| GET | `/me` | ✓ | — | 200 `{ data: User }` |
| PATCH | `/me` | ✓ | `{ name?, currentPassword?, newPassword? }` | 200 `{ data: User }` |
| DELETE | `/me` | ✓ | `{ currentPassword }` | 204 |

**규칙:** 비밀번호 변경 시 `currentPassword`와 `newPassword`는 **함께** 보낸다. 하나만 보내면 400.

### 4.3 Categories (`/api/categories`)
| Method | Path | 인증 | 요청 본문 | 성공 |
|--------|------|------|----------|------|
| GET | `/` | ✓ | — | 200 `{ data: Category[] }` |
| POST | `/` | ✓ | `{ name }` | 201 `{ data: Category }` |
| PATCH | `/:id` | ✓ | `{ name }` | 200 `{ data: Category }` |
| DELETE | `/:id` | ✓ | — | 204 |

**규칙:**
- 응답에는 기본 카테고리(`isDefault=true`, `userId=null`)와 본인 카테고리가 함께 포함된다.
- 기본 카테고리에 PATCH/DELETE 요청 시 403 `CATEGORY_DEFAULT_IMMUTABLE`.
- 연결된 할일이 있는 카테고리 삭제 시 409 `CATEGORY_HAS_TODOS` (`details.linkedTodoCount` 포함).

### 4.4 Todos (`/api/todos`)
| Method | Path | 인증 | 요청 본문 / 쿼리 | 성공 |
|--------|------|------|-----------------|------|
| GET | `/` | ✓ | `categoryId?, isCompleted?, dueDateFrom?, dueDateTo?, keyword?, page?, limit?` | 200 `{ data: Todo[], pagination }` |
| POST | `/` | ✓ | `{ categoryId, title, description?, dueDate? }` | 201 `{ data: Todo }` |
| GET | `/:id` | ✓ | — | 200 `{ data: Todo }` |
| PATCH | `/:id` | ✓ | `{ categoryId?, title?, description?, dueDate? }` | 200 `{ data: Todo }` |
| PATCH | `/:id/complete` | ✓ | `{ isCompleted: boolean }` | 200 `{ data: Todo }` |
| DELETE | `/:id` | ✓ | — | 204 |

**규칙:**
- 정렬은 `created_at DESC` 고정 (정렬 파라미터 없음).
- 페이지네이션 기본 `page=1, limit=20`, 최대 `limit=100`.
- `dueDateFrom > dueDateTo`이면 400.
- 완료 토글은 본문 `{ isCompleted: true }` 또는 `false`를 명시. `completedAt`은 서버가 자동 기록·해제.

---

## 5. 데이터 모델 (응답 필드)

### User
`id, email, name, createdAt, updatedAt` (비밀번호 해시는 절대 포함되지 않음). 로그인 응답의 `user`는 `{ id, email, name }`만 포함.

### Category
`id, userId(null|uuid), name, isDefault, createdAt`

### Todo
`id, userId, categoryId, title, description(nullable), dueDate(nullable, "YYYY-MM-DD"), isCompleted, completedAt(nullable), createdAt, updatedAt`

### Pagination
`{ page, limit, total, totalPages }`

---

## 6. 입력 검증 규칙 (백엔드 zod 기준)

프론트엔드 폼 검증은 동일하거나 더 엄격하게 맞춘다.

| 필드 | 규칙 |
|------|------|
| `email` | RFC 형식, 최대 255자 |
| `password` (가입·변경) | 8자 이상, 72자 이하 (bcrypt 한계) |
| `name` | 1~50자 |
| 카테고리 `name` | 1~50자 |
| 할일 `title` | 1~200자 |
| 할일 `description` | 최대 2000자 (선택) |
| 할일 `dueDate` | `YYYY-MM-DD` (과거 허용) |
| 목록 `keyword` | 최대 100자 |
| 목록 `limit` | 1~100 |

---

## 7. 에러 코드 카탈로그

프론트엔드는 `error.code`로 분기하고, `error.message`(한국어)는 사용자 표시에 활용한다.

| HTTP | code | 발생 위치 | 권장 UX |
|------|------|---------|---------|
| 400 | `VALIDATION_ERROR` | 모든 zod 검증 실패 | `details[].path`/`message`로 필드별 인라인 안내 |
| 400 | `BAD_REQUEST` | (예약) 기타 형식 오류 | 일반 토스트 |
| 401 | `UNAUTHENTICATED` | 토큰 없음·만료·위조 | 스토어 초기화 후 SCR-01 리다이렉트 (SCN-13) |
| 401 | `INVALID_CREDENTIALS` | 로그인 실패 | "이메일 또는 비밀번호가 올바르지 않습니다" |
| 401 | `INVALID_CURRENT_PASSWORD` | 개인정보 수정/탈퇴 시 현재 비번 불일치 | 해당 필드 인라인 |
| 403 | `CATEGORY_DEFAULT_IMMUTABLE` | 기본 카테고리 수정/삭제 시도 | UI에서 미리 차단, 응답은 토스트 |
| 404 | `USER_NOT_FOUND` | 사용자 없음 | 로그아웃 처리 |
| 404 | `CATEGORY_NOT_FOUND` | 본인 카테고리 아님/없음 | 목록 갱신 |
| 404 | `TODO_NOT_FOUND` | 본인 할일 아님/없음 | 목록 갱신 |
| 404 | `NOT_FOUND` | 라우트 미존재 | 개발 시점 확인 |
| 409 | `EMAIL_DUPLICATED` | 회원가입 중복 이메일 | 이메일 필드 인라인 |
| 409 | `CATEGORY_NAME_DUPLICATED` | 동일 사용자 내 카테고리명 중복 | 입력 필드 인라인 |
| 409 | `CATEGORY_HAS_TODOS` | 연결된 할일 존재 (`details.linkedTodoCount`) | 확인 다이얼로그에 N개 표시, 삭제 차단 |
| 500 | `INTERNAL_ERROR` | 미처리 예외 | 일반 토스트 + 재시도 안내 |

---

## 8. TanStack Query 운용 권장 사항

### 8.1 쿼리 키 컨벤션
```ts
['categories']
['todos', filters]        // filters는 쿼리 파라미터 객체
['todos', 'detail', id]
['users', 'me']
```

### 8.2 변형(mutation) 후 무효화
| 작업 | 무효화 대상 |
|------|------------|
| 할일 생성/수정/삭제/완료토글 | `['todos']` 전체 |
| 카테고리 생성/수정/삭제 | `['categories']`, `['todos']` (카테고리명 변경이 목록 표시에 영향) |
| 프로필 수정 | `['users', 'me']` |

### 8.3 인증 에러 처리
401 `UNAUTHENTICATED` 발생 시 axios 응답 인터셉터에서 즉시 토큰 제거 → 라우터가 `useAuthStore`의 변화에 반응해 SCR-01로 이동. 쿼리 재시도(`retry`)는 401에 대해 끄는 것을 권장 (`retry: (failureCount, error) => error.response?.status !== 401 && failureCount < 2`).

---

## 9. 핵심 시나리오별 호출 흐름 (`docs/3-user-scenario.md` 매핑)

| SCN | 호출 시퀀스 |
|-----|-----------|
| SCN-01 가입+로그인 | `POST /auth/register` → `POST /auth/login` → 스토어 저장 → SCR-03 |
| SCN-02 첫 할일 등록 | `GET /categories` → `POST /todos` → 목록 invalidate |
| SCN-03 사용자 카테고리 추가 | `POST /categories` → `POST /todos` |
| SCN-04 복합 필터 | `GET /todos?isCompleted=false&dueDateFrom=...&dueDateTo=...&categoryId=...` |
| SCN-05 완료 토글/Undo | `PATCH /todos/:id/complete` (true → false) |
| SCN-06 할일 수정 | `PATCH /todos/:id` |
| SCN-07 할일 삭제 | `DELETE /todos/:id` → 목록 invalidate |
| SCN-08 카테고리 수정/삭제 | `PATCH /categories/:id` / `DELETE /categories/:id` (409 처리 필수) |
| SCN-09 개인정보 수정 | `PATCH /users/me` (`currentPassword + newPassword` 페어) |
| SCN-10 회원 탈퇴 | `DELETE /users/me` with `{ currentPassword }` → 스토어 초기화 |
| SCN-13 토큰 만료 | 임의 보호 API → 401 `UNAUTHENTICATED` → 스토어 초기화 → SCR-01 |
| SCN-15 기본 카테고리 수정 시도 | UI 차단 우선, 우회 호출 시 403 `CATEGORY_DEFAULT_IMMUTABLE` |

---

## 10. 로컬 개발 체크리스트

1. 백엔드 `.env`의 `POSTGRES_CONNECTION_STRING`, `JWT_SECRET`, `CORS_ORIGIN`(프론트 포트) 설정.
2. `backend/`에서 `npm run dev` (포트 3000).
3. `frontend/.env`의 `VITE_API_BASE_URL=http://localhost:3000/api`.
4. `frontend/`에서 `npm run dev` (Vite, 기본 5173).
5. `GET http://localhost:3000/api/health`로 백엔드 헬스 확인.
6. Swagger UI(`/api/docs`)에서 실제 응답 구조를 확인하며 개발.
