# 실행계획 (Execution Plan) — TodoListApp

> **버전:** 1.0
> **작성일:** 2026-05-13
> **기반 문서:**
>
> - 도메인 정의서 v0.2 (`1-domain-definition.md`)
> - PRD v1.2 (`2-prd.md`)
> - 사용자 시나리오 v1.1 (`3-user-scenario.md`)
> - 프로젝트 구조 설계 원칙 v1.1 (`4-project-structure-principles.md`)
> - 아키텍처 다이어그램 v1.2 (`5-arch-diagram.md`)
> - ERD v1.0 (`6-erd.md`)
> - UC 다이어그램 (`99-uc.md`)
>   **상태:** 초안 (Draft)

---

## 목차

1. [개요](#1-개요)
2. [실행 원칙 및 Task 분해 기준](#2-실행-원칙-및-task-분해-기준)
3. [Day-by-Day 권장 일정 요약](#3-day-by-day-권장-일정-요약)
4. [A. 데이터베이스 (Database)](#a-데이터베이스-database)
5. [B. 백엔드 (Backend)](#b-백엔드-backend)
6. [C. 프론트엔드 (Frontend)](#c-프론트엔드-frontend)
7. [영역 간 의존성 매트릭스](#7-영역-간-의존성-매트릭스)
8. [리스크와 절충안](#8-리스크와-절충안)
9. [변경 이력](#9-변경-이력)

---

## 1. 개요

본 문서는 TodoListApp MVP(3일 일정, 2026-05-13 ~ 2026-05-15, 출시 2026-05-16)의 **실행계획**이다. 데이터베이스(DB) / 백엔드(BE) / 프론트엔드(FE) 3개 영역으로 분리하여 각각 **독립적으로 완료 검증 가능한 Task** 단위로 분해했고, Task별 완료 조건을 체크박스 형식으로 제공한다.

**총 Task 수**: DB 7개 + BE 14개 + FE 12개 = **33개**
**총 예상 소요**: 약 **45.5시간** (DB 2.6h + BE 21h + FE 21.5h, 일부 병렬 진행)

---

## 2. 실행 원칙 및 Task 분해 기준

- **독립성**: 각 Task는 다른 Task와 분리하여 검증 가능하도록 분해한다.
- **완료 조건**: 모든 Task는 객관적 검증 항목(체크박스)을 가진다. "동작한다", "파일이 존재한다" 같은 명확한 산출 기준만 사용한다.
- **의존성 명시**: 선행 Task의 ID를 명시하여 병렬/순차 실행 가능성을 식별한다.
- **추적성**: 각 Task는 FR/BR/SCN/SCR 등 상위 문서의 ID를 참조한다.
- **현실성**: 3일 일정에 맞춰 Must/Should 우선순위를 적용하고, 일정 위기 시 절충안을 §8에 명시한다.

---

## 3. Day-by-Day 권장 일정 요약

| Day                    | DB                                                   | Backend                                                                     | Frontend                                                                  |
| ---------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Day 1 (2026-05-13)** | DB-01~06 (환경, 스키마, 시드, FK, 인덱스, .env+Pool) | BE-01~07 + BE-13 골격 (초기화, Pool, env, 에러/JWT/zod 미들웨어, Auth 모듈) | FE-01~07 (초기화, 디렉토리, axios, Zustand, Router, zod, 로그인/회원가입) |
| **Day 2 (2026-05-14)** | —                                                    | BE-08~11 (User, Category, Todo, 필터 빌더)                                  | FE-08~10 (할일 목록+필터, 모달+토글+삭제, 카테고리 관리)                  |
| **Day 3 (2026-05-15)** | DB-07 (선택, 마이그레이션 정책)                      | BE-12, BE-13 최종, BE-14 (테스트, 미들웨어 조립, 부하 테스트)               | FE-11, FE-12 (마이페이지, 반응형/에러 표준화)                             |

---

## A. 데이터베이스 (Database)

### Task DB-01: PostgreSQL 17 환경 준비 — ✅ 완료 (2026-05-13)

**목표**: 로컬 기반 PostgreSQL 17 인스턴스를 실행하고 애플리케이션이 사용할 DB(`postgres` 기본 DB) 접속을 확인한다.

**담당 영역**: DB · **예상 소요**: 30분 · **의존성**: 없음

**완료 조건 (체크박스)**

- [x] `psql --version` 출력이 PostgreSQL 17.x 임을 확인한다 *(PostgreSQL 17.9 on x86_64-windows, MSVC 19.44 확인)*
- [x] 애플리케이션이 사용할 데이터베이스(`postgres`)에 지정 유저(`postgres`)로 접속 가능하다 *(`.env`의 `POSTGRES_CONNECTION_STRING`으로 `SELECT current_database()` 검증)*
- [x] 선택 방식(로컬 설치)이 `README` 또는 팀 내 문서로 공유된다 *(`.env`에 `POSTGRES_CONNECTION_STRING=postgresql://postgres:test@localhost:5432/postgres` 명시)*

**산출물**: 실행 중인 PostgreSQL 17 인스턴스, 접속 가능한 `postgres` 데이터베이스

**참고**: `.env`의 `POSTGRES_CONNECTION_STRING` 단일 URL 방식으로 통일 (구조 원칙 7.1) · **권장 일정**: Day 1 오전 최우선

---

### Task DB-02: schema.sql 실행 및 스키마 생성 검증 — ✅ 완료 (2026-05-13)

**목표**: `database/schema.sql`을 대상 DB에 실행하여 3개 테이블(`users`, `categories`, `todos`)과 모든 제약조건이 정상 생성됨을 검증한다.

**담당 영역**: DB · **예상 소요**: 20분 · **의존성**: DB-01 완료 필요

**완료 조건 (체크박스)**

- [x] `psql -f database/schema.sql` 실행이 오류 없이 완료된다 *(트랜잭션으로 일괄 실행)*
- [x] `\dt` 결과에 `users`, `categories`, `todos` 3개 테이블이 모두 존재한다 *(information_schema.tables 조회 검증)*
- [x] `\d users` / `\d categories` / `\d todos` 로 각 테이블의 컬럼·타입·NOT NULL·DEFAULT 값이 ERD v1.0 4장 명세와 일치함을 육안 확인한다
- [x] `UNIQUE (email)`, `PRIMARY KEY`, `FOREIGN KEY` 제약이 `\d+ <table>` 출력에서 모두 확인된다 *(pg_constraint 7건: users_pkey/email_key, categories_pkey/user_fk(CASCADE+DEFERRABLE), todos_pkey/user_fk(CASCADE)/category_fk(RESTRICT))*
- [x] 스크립트 재실행이 오류 없이 통과된다 *(DDL `IF NOT EXISTS` 멱등 확인)* — ⚠ **시드 INSERT는 비멱등** (매 실행마다 새 UUID로 기본 카테고리 중복 삽입). DB-03에서 `(user_id, name) WHERE is_default` 부분 UNIQUE 또는 시드 분리(DB-07)로 해결 필요

**산출물**: `database/schema.sql` (실행 검증 완료)

**참고**: R-05 리스크 대응 · 시드 멱등성 결함은 DB-03에서 종결 · **권장 일정**: Day 1 오전 (DB-01 직후)

---

### Task DB-03: 기본 카테고리 시드 데이터 검증 — ✅ 완료 (2026-05-13)

**목표**: 기본 카테고리 4건(업무·개인·학습·기타)이 정확히 삽입되고 재실행 시에도 중복 없이 유지됨을 검증, OI-02 종결.

**담당 영역**: DB · **예상 소요**: 15분 · **의존성**: DB-02 완료 필요

**완료 조건 (체크박스)**

- [x] `SELECT * FROM categories WHERE is_default = true;` 결과가 정확히 4건(업무, 개인, 학습, 기타)
- [x] 4건 모두 `user_id IS NULL`, `is_default = true` 조건 만족
- [x] 스크립트 재실행 후에도 중복 삽입 없이 4건 유지 *(부분 UNIQUE 인덱스 `uq_categories_default_name` + `ON CONFLICT (name) WHERE ... DO NOTHING` — `INSERT 0 0` 확인)*
- [x] OI-02 종결 처리

**산출물**: 검증된 시드 + `database/seeds/20260513_0001_default_categories.sql` (멱등 처리)

**참고**: ERD v1.0 7장 · **권장 일정**: Day 1 오전

---

### Task DB-04: 외래키 ON DELETE CASCADE / RESTRICT 동작 테스트 — ✅ 완료 (2026-05-13)

**목표**: `users` 삭제 시 CASCADE, `categories` 삭제 시 RESTRICT 동작을 DML로 검증 (BR-U4, OI-01).

**담당 영역**: DB · **예상 소요**: 30분 · **의존성**: DB-03 완료 필요

**완료 조건 (체크박스)**

- [x] 테스트 유저 1건 + 사용자 정의 카테고리 1건 + 할일 2건 INSERT
- [x] `DELETE FROM users WHERE id = <test>` 후 해당 유저의 `todos`·사용자 정의 `categories` 자동 삭제, 기본 카테고리 4건 보존 (BR-U4)
- [x] 할일 연결 카테고리 삭제 시 `foreign_key_violation` 발생 (RESTRICT, BR-C4)
- [x] 할일이 없는 사용자 정의 카테고리는 정상 삭제됨
- [x] 테스트 임시 데이터 정리

**산출물**: 검증 로그 *(PL/pgSQL `DO $$ ... $$` 테스트 블록 — `NOTICE: DB-04 OK: RESTRICT 작동, CASCADE 작동, 기본카테고리 4 건 보존, 빈 카테고리 삭제 정상`)*

**참고**: PRD 10.3, R-05, OI-01 DB 기본값 확인 · **권장 일정**: Day 1 오후

---

### Task DB-05: 인덱스 생성 확인 및 EXPLAIN 검증 — ✅ 완료 (2026-05-13)

**목표**: 필수 인덱스 5종 생성 확인 및 주요 쿼리 패턴 Index Scan 사용 검증.

**담당 영역**: DB · **예상 소요**: 30분 · **의존성**: DB-03 완료 필요

**완료 조건 (체크박스)**

- [x] 5개 인덱스 존재 확인 *(`idx_categories_user_id`, `idx_todos_user_id`, `idx_todos_user_id_is_completed`, `idx_todos_user_id_due_date`, `idx_todos_category_id`)*
- [x] `EXPLAIN SELECT * FROM todos WHERE user_id = $1` → Bitmap Index Scan (3000행 / 30 유저 데이터 부풀린 후 ANALYZE)
- [x] 복합 인덱스 `(user_id, is_completed)` 활용 (planner는 비용 최적 인덱스 선택 — 본 케이스에서는 `user_id_due_date` 우선)
- [x] 복합 인덱스 `(user_id, due_date)` 활용 (range 필터 Bitmap Index Scan 확인)
- [x] `idx_todos_category_id` 활용 (`WHERE category_id = $1` Bitmap Index Scan 확인)

**산출물**: EXPLAIN 결과 *(`Bitmap Index Scan on idx_todos_user_id_due_date`, `Bitmap Index Scan on idx_todos_category_id` 등 검증 로그)*

**참고**: PRD 3.2 (P95 < 500ms KPI) · **권장 일정**: Day 1 오후

---

### Task DB-06: .env DB 연결 정보 정의 및 pg Connection Pool 설정 — ✅ 완료 (2026-05-13)

**목표**: `.env` / `.env.example`에 DB 연결 환경변수 정의 및 `db/pool.js` 정상 동작 확인.

**담당 영역**: DB / 백엔드 연결 · **예상 소요**: 30분 · **의존성**: DB-01 완료 필요

**완료 조건 (체크박스)**

- [x] `.env.example`에 `POSTGRES_CONNECTION_STRING` 항목 존재 (`postgresql://<user>:<password>@<host>:<port>/<database>`)
- [x] `backend/src/config/env.js`에서 환경변수 zod 검증 후 `Object.freeze` 객체 export
- [x] `backend/src/db/pool.js`가 단일 `pg.Pool` 인스턴스 export, `max: 20` 포함
- [x] 서버 기동 시 `pool.query('SELECT 1')` 헬스체크 성공 *(로그: `[db] healthCheck: OK`)*
- [x] `.env`가 `.gitignore`에 등록 (`.env`, `.env.*`, `!.env.example`), `.env.example`만 커밋

**산출물**: `backend/src/db/pool.js`, `backend/src/config/env.js`, `.env.example`, `backend/.env.example`

**참고**: PRD 7.3, R-04, R-06 · **권장 일정**: Day 1 (BE-02와 통합 완료)

---

### Task DB-07: 마이그레이션 운영 정책 수립 및 파일 분리 — ✅ 완료 (2026-05-13)

**목표**: `schema.sql`을 단계별 마이그레이션 파일로 분리하고 정책을 문서화.

**담당 영역**: DB · **예상 소요**: 30분 · **의존성**: DB-02 완료 필요

**완료 조건 (체크박스)**

- [x] `database/migrations/` 디렉토리에 3개 파일 존재 (`20260513_0001_init_users.sql`, `20260513_0002_init_categories.sql`, `20260513_0003_init_todos.sql`)
- [x] `database/seeds/20260513_0001_default_categories.sql` 존재 (멱등 — 부분 UNIQUE 인덱스 + `ON CONFLICT (name) WHERE ...`)
- [x] 파일 명명 규칙 `{YYYYMMDD}_{NNNN}_{snake_case}.sql` 준수 (구조 원칙 10.3)
- [x] 순서대로 실행 시 `schema.sql` 단일 실행과 동일 결과 *(재실행 검증: tables=3, idx=5, default_categories=4)*
- [x] 실행 순서가 `database/README.md`에 명시 (powershell 예시 포함)

**산출물**: `database/migrations/*.sql` (3개), `database/seeds/*.sql` (1개), `database/README.md`

**참고**: 구조 원칙 10.3 · **권장 일정**: Day 1 말 (완료)

---

### DB 영역 요약 표

| Task ID | 제목                              | 소요 | 의존성 | Day           |
| ------- | --------------------------------- | ---- | ------ | ------------- |
| DB-01   | PostgreSQL 17 환경 준비           | 30분 | 없음   | Day 1         |
| DB-02   | schema.sql 실행 및 검증           | 20분 | DB-01  | Day 1         |
| DB-03   | 기본 카테고리 시드 검증           | 15분 | DB-02  | Day 1         |
| DB-04   | ON DELETE CASCADE/RESTRICT 테스트 | 30분 | DB-03  | Day 1         |
| DB-05   | 인덱스 / EXPLAIN 검증             | 30분 | DB-03  | Day 1         |
| DB-06   | .env / Connection Pool 설정       | 30분 | DB-01  | Day 1         |
| DB-07   | 마이그레이션 정책 (선택)          | 30분 | DB-02  | Day 1말~Day 3 |

**필수(DB-01~06) 총 소요**: 약 **2시간 35분**

---

## B. 백엔드 (Backend)

### Task BE-01: 프로젝트 초기화 및 디렉토리 구조 셋업 — ✅ 완료 (2026-05-13)

**목표**: Node.js + Express 백엔드 프로젝트(순수 JavaScript)를 구조 원칙에 맞게 초기화. TypeScript·`tsconfig.json` 미사용.

**담당 영역**: Backend · **예상 소요**: 1시간 · **의존성**: 없음

**완료 조건 (체크박스)**

- [x] `backend/` 루트에 `package.json` 존재 (TypeScript·tsconfig 없음)
- [x] `node src/server.js` 실행 시 Express 서버 기동 확인 *(http://localhost:3001 listening)*
- [x] `src/modules/{auth,users,todos,categories}/`, `src/middlewares/`, `src/db/`, `src/config/`, `src/utils/` 생성
- [x] ESLint(`eslint:recommended`) + Prettier 설정
- [x] `.env.example`에 `PORT`, `POSTGRES_CONNECTION_STRING`, `JWT_SECRET`, `JWT_ACCESS_TOKEN_TTL`, `BCRYPT_COST`, `CORS_ORIGIN`, `NODE_ENV` 포함
- [x] `.gitignore`에 `.env`, `node_modules/`, `dist/` 포함

**산출물**: `backend/package.json`, `src/app.js`, `src/server.js`, `.env.example`

**참고**: 구조 원칙 9.1, 11.3

---

### Task BE-02: pg Connection Pool 설정 — ✅ 완료 (2026-05-13)

**목표**: `pg.Pool` 단일 인스턴스 + graceful shutdown.

**담당 영역**: Backend · **예상 소요**: 30분 · **의존성**: BE-01

**완료 조건 (체크박스)**

- [x] `src/db/pool.js`에서 `new Pool({ connectionString, max: 20 })` 단일 인스턴스 export
- [x] `max: 20` 설정
- [x] 서버 기동 시 `pool.query('SELECT 1')` 성공 로그 *(`[db] healthCheck: OK` 확인)*
- [x] SIGTERM/SIGINT 수신 시 `pool.end()` 호출 (graceful shutdown — `server.js`)
- [x] Repository 외 다른 레이어에서 pool 직접 import 불가 (사용 규약 — 코드 리뷰 시 검증)

**산출물**: `backend/src/db/pool.js`

**참고**: PRD 7.3, 구조 원칙 9.3

---

### Task BE-03: 환경변수 / 설정 모듈 — ✅ 완료 (2026-05-13)

**목표**: `process.env` 일괄 로드·검증 후 검증·동결된 객체 노출.

**담당 영역**: Backend · **예상 소요**: 30분 · **의존성**: BE-01

**완료 조건 (체크박스)**

- [x] `src/config/env.js`에서 필수 환경변수 누락 시 zod 검증 실패 → `process.exit(1)`
- [x] `BCRYPT_COST` < 12 이면 기동 거부 *(zod `.min(12)`)*
- [x] 필수 환경변수가 zod 스키마로 검증·`Object.freeze`된 객체로 export됨
- [x] 다른 파일에서 `process.env.*` 직접 참조 없음 (모두 `require('./config/env')` 경유)

**산출물**: `backend/src/config/env.js`

**참고**: PRD 7.2, 구조 원칙 7.1

---

### Task BE-04: 에러 미들웨어 + 표준 에러 응답 스키마 — ✅ 완료 (2026-05-13)

**목표**: 통합 에러 핸들러 + 일관된 JSON 에러 응답.

**담당 영역**: Backend · **예상 소요**: 1시간 · **의존성**: BE-01

**완료 조건 (체크박스)**

- [x] `src/middlewares/error.middleware.js` 구현 (`notFoundHandler`, `errorHandler`)
- [x] 응답 스키마 `{ success: false, error: { code, message, details? } }`
- [x] `AppError` 클래스 정의 (`statusCode`, `code`, `message`, optional `details`)
- [x] 운영 환경(`NODE_ENV=production`)에서 원본 에러 메시지/스택 미노출
- [x] `src/utils/async-handler.js`로 async route wrapping
- [x] 404 응답 처리 확인 *(curl /존재하지않음 → 404 NOT_FOUND)*

**산출물**: `error.middleware.js`, `async-handler.js`, `utils/app-error.js`

**참고**: PRD 7.5, 구조 원칙 9.2

---

### Task BE-05: JWT 인증 미들웨어 — ✅ 완료 (2026-05-13)

**목표**: `Authorization: Bearer <token>` 검증 + `req.user` 주입.

**담당 영역**: Backend · **예상 소요**: 1시간 · **의존성**: BE-03, BE-04

**완료 조건 (체크박스)**

- [x] `auth.middleware.js` — 토큰 누락/무효/만료 시 401 UNAUTHENTICATED *(curl logout 무토큰 → 401 검증)*
- [x] `src/utils/jwt.js`에 `signToken/verifyToken` wrapper (TTL = `env.jwtAccessTokenTtl`)
- [x] `req.user = { id: "<uuid>" }` 주입 (JSDoc `@typedef ReqUser`)
- [x] 인증이 필요한 라우터에 미들웨어 체이닝 *(예: `/api/auth/logout`)*

**산출물**: `middlewares/auth.middleware.js`, `utils/jwt.js`

**참고**: PRD 7.2 (JWT TTL 1시간), FR-06, BR-U3

---

### Task BE-06: zod 검증 유틸 / 공통 validator — ✅ 완료 (2026-05-13)

**목표**: 서버 사이드 zod 검증 미들웨어 팩토리 + 모듈별 스키마.

**담당 영역**: Backend · **예상 소요**: 1시간 · **의존성**: BE-01, BE-04

**완료 조건 (체크박스)**

- [x] `validate(schema, target)` 팩토리 — 실패 시 zod 오류를 errorHandler가 400 + `details` 배열로 변환 *(curl 검증)*
- [x] auth 스키마: `RegisterSchema`, `LoginSchema`
- [x] users 스키마: `UpdateProfileSchema`, `WithdrawSchema`
- [x] todos 스키마: `CreateTodoSchema`, `UpdateTodoSchema`, `ToggleCompleteSchema`, `ListTodosQuerySchema`
- [x] categories 스키마: `CreateCategorySchema`, `UpdateCategorySchema`
- [x] 검증 실패 응답이 BE-04 표준 스키마(`{ success: false, error: { code, message, details } }`)와 일치

**산출물**: `middlewares/validate.middleware.js`, 각 모듈의 `*.validator.js`

**참고**: PRD 7.2

---

### Task BE-07: Auth 모듈 — 회원가입 / 로그인 / 로그아웃 — ✅ 완료 (2026-05-13)

**목표**: 회원가입, 로그인(JWT 발급), 로그아웃 3개 API.

**담당 영역**: Backend · **예상 소요**: 2시간 · **의존성**: BE-02, BE-05, BE-06

**완료 조건 (체크박스)**

- [x] `POST /api/auth/register` — 중복 시 409 EMAIL_DUPLICATED, 성공 시 201 *(bcrypt cost 12 확인: `$2b$12$` prefix, 60자)*
- [x] `POST /api/auth/login` — 불일치 시 401 INVALID_CREDENTIALS, 성공 시 200 + `{ accessToken, user }`
- [x] `POST /api/auth/logout` — `authMiddleware` 적용, 200 반환, 토큰 없으면 401
- [x] `utils/password.js`에 `hashPassword/comparePassword` (bcrypt, cost = `env.bcryptCost`)
- [x] Repository 모든 쿼리 Parameterized Query (`$1, $2, ...`)
- [x] 응답에 `password_hash` 절대 미포함 *(register/login 응답 페이로드 검증)*

**산출물**: `modules/auth/auth.{router,service,validator}.js`, `modules/users/users.repository.js`, `utils/password.js`

**검증 로그 (2026-05-13)**:
- `POST /register` → 201 + `{ id, email, name, createdAt, updatedAt }` (no `password_hash`)
- `POST /register` 중복 → 409 `EMAIL_DUPLICATED`
- `POST /login` 잘못된 비밀번호 → 401 `INVALID_CREDENTIALS`
- `POST /login` 정상 → 200 + JWT (188자, alg=HS256, sub=user.id, exp=+1h)
- `POST /logout` Bearer → 200, 미인증 → 401 `UNAUTHENTICATED`
- 검증 실패 → 400 `VALIDATION_ERROR` + `details: [{path, message}, ...]`

**참고**: FR-01~03, BR-U1, BR-U2

---

### Task BE-08: User 모듈 — 내 정보 / 회원 탈퇴(트랜잭션) — ✅ 완료 (2026-05-13)

**목표**: 내 정보 조회·수정, 회원 탈퇴(CASCADE 하드 삭제 트랜잭션).

**담당 영역**: Backend · **예상 소요**: 2시간 · **의존성**: BE-05, BE-06, BE-07

**완료 조건 (체크박스)**

- [x] `GET /api/users/me` — `req.user.id` 기반, `password_hash` 미포함 *(응답 페이로드 검증)*
- [x] `PATCH /api/users/me` — `currentPassword` 불일치 시 401 `INVALID_CURRENT_PASSWORD`, 성공 시 `updated_at` 갱신 *(2회 PATCH 시 시간 증가 확인)*
- [x] `DELETE /api/users/me` — `BEGIN/COMMIT/ROLLBACK` 트랜잭션, CASCADE 자동 정리, 204
- [x] 실패 시 ROLLBACK + `client.release()` 보장 *(존재하지 않는 user_id 탈퇴 후 pool stats: totalCount=1, idleCount=1, waitingCount=0)*

**산출물**: `modules/users/users.{router,service,repository,validator}.js`

**검증 로그 (2026-05-13)**:
- `GET /me` 200 + `{id,email,name,createdAt,updatedAt}` / 미인증 401
- `PATCH /me {name}` 200 + 새 이름 + updated_at 갱신
- `PATCH /me {currentPassword,newPassword}` 200 → 새 비밀번호로 재로그인 성공
- `PATCH /me {currentPassword:잘못된값,newPassword}` 401 `INVALID_CURRENT_PASSWORD`
- `DELETE /me {currentPassword:잘못된값}` 401 / 정상 204 → GET /me 404 `USER_NOT_FOUND`
- 탈퇴 후 DB 검증: `users=0, todos=0, user_categories=0, default_categories=4` (CASCADE 작동 + 기본 카테고리 보존, BR-U4)

**참고**: FR-04, FR-05, BR-U3, BR-U4, PRD 7.4

---

### Task BE-09: Category 모듈 — ✅ 완료 (2026-05-13)

**목표**: 카테고리 CRUD API.

**담당 영역**: Backend · **예상 소요**: 1.5시간 · **의존성**: BE-05, BE-06

**완료 조건 (체크박스)**

- [x] `GET /api/categories` — `WHERE user_id = $1 OR user_id IS NULL` (기본 4 + 사용자 정의)
- [x] `POST /api/categories` — 동일 사용자 내 중복 시 409 CATEGORY_NAME_DUPLICATED (BR-C3)
- [x] `PATCH /api/categories/:id` — `is_default=true` 시 403 CATEGORY_DEFAULT_IMMUTABLE (BR-C1)
- [x] `DELETE /api/categories/:id` — `is_default=true` 시 403; 연결 Todo 시 409 CATEGORY_HAS_TODOS (BR-C4)
- [x] 모든 쿼리에 `WHERE user_id = $1` (또는 `OR user_id IS NULL` for default)
- [x] 타 사용자 카테고리 접근 시 404 CATEGORY_NOT_FOUND

**산출물**: `modules/categories/{router,service,repository,validator}.js`

**참고**: FR-14~17, BR-C1~C4

---

### Task BE-10: Todo 모듈 — CRUD + 완료/취소 — ✅ 완료 (2026-05-13)

**목표**: 할일 CRUD + 완료 토글.

**담당 영역**: Backend · **예상 소요**: 2.5시간 · **의존성**: BE-05, BE-06, BE-09

**완료 조건 (체크박스)**

- [x] `POST /api/todos` — `user_id = req.user.id` 강제, 201 (category 접근 가능성 사전 검증)
- [x] `GET /api/todos/:id` — 타 사용자 항목 404 TODO_NOT_FOUND (BR-U3 격리)
- [x] `PATCH /api/todos/:id` — 완료된 항목도 수정 허용 (BR-T4, 단위 테스트 통과)
- [x] `PATCH /api/todos/:id/complete` — `is_completed`에 따라 `completed_at` 자동 `now()` 또는 NULL (BR-T3, 양방향 토글 검증)
- [x] `DELETE /api/todos/:id` — `WHERE id = $1 AND user_id = $2`, 204
- [x] 모든 Repository 메서드가 `userId` 인자 요구 (`buildFilterClauses`, `findByIdForUser`, `updateForUser`, `toggleComplete`, `deleteForUser`, `create`)

**산출물**: `modules/todos/{router,service,repository,validator}.js`

**참고**: FR-07, FR-10~13, BR-T1~T5, BR-U3

---

### Task BE-11: 할일 목록 동적 필터 SQL 빌더 — ✅ 완료 (2026-05-13)

**목표**: 복합 필터를 안전한 Parameterized Query로 처리.

**담당 영역**: Backend · **예상 소요**: 1.5시간 · **의존성**: BE-10

**완료 조건 (체크박스)**

- [x] `buildFilterClauses(userId, filters)` — `WHERE user_id = $1` 고정 + 옵션 필터 동적 추가
- [x] 파라미터 인덱스 순차 누적 (SQL Injection 방지) — 모든 값은 `$N` 파라미터로 전달
- [x] `categoryId`, `dueDateFrom/To`, `isCompleted`, `keyword`(ILIKE) 독립/조합 테스트 통과 (5 단위 테스트)
- [x] 필터 미적용 시 전체 목록 + 기본 정렬 `created_at DESC` + 페이지네이션 `LIMIT/OFFSET`
- [x] 쿼리 파라미터 파싱·zod 검증 (`ListTodosQuerySchema`, `dueDateFrom <= dueDateTo` refine)
- [x] 문자열 결합 SQL 사용 없음 — 키워드 ILIKE도 `%${kw}%`를 파라미터로 binding

**산출물**: `modules/todos/todos.repository.js`, `todos.validator.js`, `__tests__/todos.repository.builder.test.js`

**참고**: FR-08, FR-09, R-02

---

### Task BE-12: 단위 테스트 — Service 레이어 핵심 BR — ✅ 완료 (2026-05-13)

**목표**: 핵심 비즈니스 규칙을 Vitest로 검증.

**담당 영역**: Backend · **예상 소요**: 2시간 · **의존성**: BE-07~BE-11

**완료 조건 (체크박스)**

- [x] Vitest 설정 (`vitest.config.js`, `globals: true`, `npm test`)
- [x] `auth.service` — 중복 이메일 409, 잘못된 비밀번호 401 (실제 bcrypt compare)
- [x] `auth.service` — 발급 토큰이 `verifyToken`으로 검증됨 (sub = user.id)
- [x] `categories.service` — `is_default=true` 수정/삭제 403 (BR-C1), 중복 이름 409 (BR-C3), 연결 todo 409 (BR-C4)
- [x] `todos.service` — 완료/취소 시 `completed_at` 토글 (BR-T3), 완료 항목 수정 허용 (BR-T4), 타 사용자 404 (BR-U3)
- [x] `todos.repository.buildFilterClauses` — 5가지 조합(단독·복합) SQL 파라미터 검증

**산출물**: `vitest.config.js`, `src/modules/{auth,categories,todos}/__tests__/*.test.js` (4 파일 / 22 테스트)

**검증 결과**: `Test Files 4 passed (4) · Tests 22 passed (22)`

**참고**: 구조 원칙 6.2, 6.6

---

### Task BE-13: 로깅 / CORS / 보안 헤더 — ✅ 완료 (2026-05-13)

**목표**: 요청 로깅, CORS, JSON 파싱, 보안 헤더 미들웨어 조립.

**담당 영역**: Backend · **예상 소요**: 1시간 · **의존성**: BE-04

**완료 조건 (체크박스)**

- [x] `request-logger.middleware.js` — `[METHOD] /path → STATUS ms` (Authorization·body는 로그 미포함)
- [x] CORS — `env.corsOrigin` 단일 origin, wildcard 미사용
- [x] `express.json({ limit: '1mb' })` 적용
- [x] `helmet()` 적용 (`Strict-Transport-Security`, `X-Content-Type-Options`, etc.)
- [x] 운영(`NODE_ENV=production`)에서 HTTPS 강제 (proxy 뒤 `trust proxy`, http → 301 redirect)
- [x] `app.js`에서 모든 모듈이 `/api/*`로 마운트 (`/auth`, `/users`, `/categories`, `/todos`, `/health`)

**산출물**: `middlewares/request-logger.middleware.js`, `app.js`

**참고**: PRD 7.2, 7.5

---

### Task BE-14: 부하 테스트 — 300명 동시접속 P95 검증 — ⚙️ 스크립트 작성 완료 (실측은 운영 환경에서 실행)

**목표**: k6로 300 VU 부하 테스트, P95 < 500ms 확인.

**담당 영역**: Backend · **예상 소요**: 1.5시간 · **의존성**: BE-07~BE-13 전체

**완료 조건 (체크박스)**

- [x] 시나리오: setup() 가입·로그인 → POST /todos → GET /todos 플로우 (`backend/load-test/k6-todos.js`)
- [x] 300 VU 부하 단계 설정 (20s ramp-up → 40s 유지 → 20s ramp-down), 임계값 `http_req_failed<0.01`
- [x] P95 < 500ms threshold (`http_req_duration: p(95)<500`)
- [ ] **실측 결과** pg Pool(max 20) 대기열 정상 동작 (커넥션 고갈 없음) — *k6 설치 후 운영 환경에서 실행*
- [ ] **실측 결과 요약 기록** — README 표 양식에 기록 *(개발 환경 실측 보류, PRD 7.1 KPI 검증용)*

**산출물**: `backend/load-test/k6-todos.js`, `backend/load-test/README.md`

**실행**: `k6 run -e BASE_URL=http://localhost:3001 backend/load-test/k6-todos.js`

**참고**: PRD 3.2, 7.1, R-06

---

### 백엔드 영역 요약 표

| Task ID | 제목                      | 소요 | 의존성              | Day                       |
| ------- | ------------------------- | ---- | ------------------- | ------------------------- |
| BE-01   | 프로젝트 초기화           | 1h   | 없음                | Day 1                     |
| BE-02   | pg Pool 설정              | 30분 | BE-01               | Day 1                     |
| BE-03   | 환경변수 모듈             | 30분 | BE-01               | Day 1                     |
| BE-04   | 에러 미들웨어 + 스키마    | 1h   | BE-01               | Day 1                     |
| BE-05   | JWT 인증 미들웨어         | 1h   | BE-03, BE-04        | Day 1                     |
| BE-06   | zod 검증 유틸             | 1h   | BE-01, BE-04        | Day 1                     |
| BE-07   | Auth 모듈                 | 2h   | BE-02, BE-05, BE-06 | Day 1                     |
| BE-08   | User 모듈 (트랜잭션 탈퇴) | 2h   | BE-05~07            | Day 2                     |
| BE-09   | Category 모듈             | 1.5h | BE-05, BE-06        | Day 2                     |
| BE-10   | Todo 모듈                 | 2.5h | BE-05, BE-06, BE-09 | Day 2                     |
| BE-11   | 동적 필터 SQL 빌더        | 1.5h | BE-10               | Day 2                     |
| BE-12   | Service 단위 테스트       | 2h   | BE-07~11            | Day 3                     |
| BE-13   | 로깅/CORS/보안 헤더       | 1h   | BE-04               | Day 1 골격 / Day 3 마무리 |
| BE-14   | 부하 테스트               | 1.5h | BE-07~13            | Day 3                     |

**총 예상 소요**: 약 **21시간**

---

## C. 프론트엔드 (Frontend)

### Task FE-01: 프로젝트 초기화 및 개발 환경 — ✅ 완료 (2026-05-13)

- **목표**: React 19 + TypeScript + Vite 기반 초기화.
- **담당 영역**: Frontend
- **예상 소요**: 1.5시간
- **의존성**: 없음
- **완료 조건 (체크박스)**:
  - [x] Vite로 React 19 + TS 프로젝트 생성 *(vite 5.4.21, react 19, react-dom 19, @vitejs/plugin-react 4.3.x)*
  - [x] `tsconfig.json` strict 모드 *(strict + noImplicitAny + strictNullChecks + noUnusedLocals/Parameters + noFallthroughCasesInSwitch)*
  - [x] ESLint + Prettier 설정 + lint 통과 *(ESLint 9 flat config, typescript-eslint, eslint-config-prettier, react-hooks, react-refresh)*
  - [x] `npm run lint`, `npm run build` 성공 *(lint: 0 errors, build: dist/index.html + assets/index-*.js 193.5kB)*
  - [x] `.env.example`, `.gitignore` 작성 *(VITE_API_BASE_URL placeholder, node_modules/dist/.env 제외)*
  - [x] `vite.config.ts`에 `@/` alias 설정 *(`@` → `./src` — tsconfig paths와 동기화, vitest 테스트로 alias 해석 검증)*
- **산출물**: `frontend/vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `.prettierrc.json`, `.env.example`, `.gitignore`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `vitest.config.ts`, `src/__tests__/smoke.test.ts`
- **검증**: `npm run lint` (0 errors), `npm run build` (tsc --noEmit 통과 + vite build 1.26s 성공), `npm test` (smoke 2 tests passed — `@/` alias 해석 + vite env types)
- **참고**: PRD 8.1, 구조 원칙 6.4

---

### Task FE-02: Feature 디렉토리 / 공통 타입 셋업 — ✅ 완료 (2026-05-13)

- **목표**: Feature 기반 폴더 + shared/lib/pages + 공통 타입.
- **담당 영역**: Frontend
- **예상 소요**: 1시간
- **의존성**: FE-01
- **완료 조건 (체크박스)**:
  - [x] `src/features/{auth,todos,categories,users}/` 하위 `components/hooks/api/types/` 생성 (auth는 `store/` 추가)
  - [x] `src/shared/{components,hooks,utils,types}/` 생성
  - [x] `src/lib/`, `src/pages/`, `src/routes/` 생성
  - [x] `src/shared/types/index.ts`에 `ApiError` 클래스 + `ApiErrorBody`, `Pagination`, `PaginatedResponse` 정의 (백엔드 `error.middleware.js` 스키마 정합)
  - [x] 각 feature 도메인 타입 파일 초기 생성 — `auth.types.ts` (LoginRequest/RegisterRequest/LoginResponse/AuthState), `user.types.ts` (User/UpdateProfileRequest/WithdrawRequest), `todo.types.ts` (Todo/CreateTodoRequest/UpdateTodoRequest/ToggleCompleteRequest/TodoListFilters), `category.types.ts` (Category/CreateCategoryRequest/UpdateCategoryRequest) — 백엔드 `mapRow` 결과 shape과 일치
- **산출물**: 디렉토리 트리(빈 디렉토리는 `.gitkeep`), `src/shared/types/index.ts`, 각 feature `types/*.types.ts`, `src/__tests__/fe-02-structure.test.ts`
- **검증**: `npm test` 28 tests passed (FE-02 디렉토리 24개 존재 검증 + ApiError 인스턴스 + 4개 도메인 타입 모듈 import) / `npm run lint` 0 errors / `npm run build` tsc + vite 성공
- **참고**: 구조 원칙 8.1~8.3

---

### Task FE-03: axios 클라이언트 + 인터셉터 — ✅ 완료 (2026-05-13)

- **목표**: 토큰 자동 부착 + 401 자동 로그아웃.
- **담당 영역**: Frontend
- **예상 소요**: 1.5시간
- **의존성**: FE-01, FE-02
- **완료 조건 (체크박스)**:
  - [x] `lib/api-client.ts`에 axios 인스턴스, `baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'`, 10s 타임아웃, JSON Content-Type 기본
  - [x] Request 인터셉터: `useAuthStore.getState().token` → `Authorization: Bearer <token>` (토큰 없으면 헤더 미부착)
  - [x] Response 인터셉터: 401 → `clearToken()` + `window.location.href = '/login'` (현재 경로가 `/login`이면 재이동 생략)
  - [x] 에러 응답을 `ApiError`로 정규화 — 백엔드 `{ success: false, error: { code, message, details? } }` 스키마 매핑, 네트워크 에러 `NETWORK_ERROR`, 타임아웃 `TIMEOUT`, 비표준 응답 `UNKNOWN_ERROR`
  - [x] localStorage/sessionStorage/Cookie 토큰 접근 코드 없음 *(소스 정적 grep 테스트로 검증, zustand persist 미사용)*
- **산출물**: `lib/api-client.ts`, `features/auth/store/auth-store.ts` (FE-04에서 확장), `lib/__tests__/api-client.test.ts`
- **검증**: `npm test` 40 tests passed (api-client 12건: baseURL, Bearer 부착/미부착, 4xx 정규화, validation details 보존, 401 clear+redirect, /login 중복 redirect 차단, network/timeout/비표준 응답, 보안 grep 2건) / `npm run lint` 0 errors / `npm run build` 성공
- **참고**: PRD 7.2, SCN-13

---

### Task FE-04: Zustand `useAuthStore` + TanStack Query Provider — ✅ 완료 (2026-05-13)

- **목표**: 인메모리 토큰 스토어 + Query Provider.
- **담당 영역**: Frontend
- **예상 소요**: 1시간
- **의존성**: FE-01, FE-02
- **완료 조건 (체크박스)**:
  - [x] `useAuthStore` — `token`, `user`, `isAuthenticated`, `setToken(token, user)`, `clearToken()` (FE-03에서 선구현, FE-04에서 단위 테스트 보강)
  - [x] Zustand `persist` 미들웨어 미사용 — `setToken` 호출 후 localStorage/sessionStorage에 토큰 미저장을 단위 테스트로 검증
  - [x] `lib/query-client.ts`에 `QueryClient` 단일 인스턴스 export — `staleTime: 30s`, `gcTime: 5min`, `retry`: 4xx 즉시 중단 + 5xx 최대 2회, `refetchOnWindowFocus: false`, `mutations.retry: false`
  - [x] `QueryClientProvider`로 앱 래핑 — `main.tsx`에서 `<StrictMode><QueryClientProvider client={queryClient}><App/>` 구조
  - [x] 새로고침 시 토큰 소멸 → 비로그인 전환 — 인메모리만 사용하므로 자연스럽게 휘발 (store 초기 상태가 `{token: null, isAuthenticated: false}`, persist 미사용으로 영속 복원 경로 없음 — 테스트로 보장)
- **산출물**: `features/auth/store/auth-store.ts`, `lib/query-client.ts`, `main.tsx`, `features/auth/store/__tests__/auth-store.test.ts`, `lib/__tests__/query-client.test.tsx`
- **검증**: `npm test` 49 tests passed (auth-store 4건 — 초기 상태/setToken/clearToken/영속화 부재 + query-client 5건 — 단일 인스턴스/4xx 재시도 차단/5xx 2회 재시도/mutations.retry=false/Provider 통합 렌더링) / `npm run lint` 0 errors / `npm run build` 성공 (222.28kB — TanStack Query 추가됨)
- **참고**: PRD FR-02/FR-03, SCN-13

---

### Task FE-05: React Router + Protected Route — ✅ 완료 (2026-05-13)

- **목표**: 라우팅 + 인증 가드.
- **담당 영역**: Frontend
- **예상 소요**: 1시간
- **의존성**: FE-04
- **완료 조건 (체크박스)**:
  - [x] 라우터 정의 — `/login`, `/register`, `/todos`, `/categories`, `/mypage`, `/` 폴백, `*` 미정의 경로 폴백
  - [x] `ProtectedRoute` — 비로그인 시 `<Navigate to="/login" replace state={{from}}/>`, `useAuthStore`의 `isAuthenticated` 셀렉터 구독
  - [x] 비로그인 상태 `/todos` 접근 → `/login` 리다이렉트 (테스트 검증)
  - [x] 로그인 상태 `/login` 접근 → `/todos` 리다이렉트 (`PublicOnlyRoute` 추가)
- **산출물**: `routes/index.tsx`, `routes/ProtectedRoute.tsx`, `routes/PublicOnlyRoute.tsx`, `pages/{Login,Register,TodoList,Categories,My}Page.tsx` (스텁), `App.tsx` (BrowserRouter 래핑), `routes/__tests__/routes.test.tsx`
- **검증**: `npm test` 62 tests passed (라우팅 13건 — 비로그인 시 3개 보호 경로 모두 /login 리다이렉트, /login·/register 정상 노출, 로그인 시 /login·/register → /todos 리다이렉트, 보호 경로 정상 렌더, / 폴백 두 케이스, 미정의 경로 폴백) / `npm run lint` 0 errors / `npm run build` 261.55kB 성공
- **참고**: PRD FR-06, 9.2

---

### Task FE-06: zod 스키마 + 공통 유틸 — ✅ 완료 (2026-05-13)

- **목표**: 폼 검증 zod 스키마 + 날짜 유틸.
- **담당 영역**: Frontend
- **예상 소요**: 1시간
- **의존성**: FE-02
- **완료 조건 (체크박스)**:
  - [x] 회원가입/로그인 스키마 — `LoginSchema`, `RegisterSchema`(passwordConfirm refine 포함) (백엔드 `auth.validator.js`와 정합, zod ^3.23.8)
  - [x] 할일 스키마 — `CreateTodoSchema`, `UpdateTodoSchema`(nullable dueDate/description), `TodoListFiltersSchema`(from≤to refine)
  - [x] 카테고리 스키마 — `CreateCategorySchema`, `UpdateCategorySchema` (1~50자)
  - [x] 사용자 스키마 — `UpdateProfileSchema`(currentPassword↔newPassword 동반 refine + newPasswordConfirm 일치 refine), `WithdrawSchema`
  - [x] 날짜 범위 `from <= to` `.refine()` 검증 — `TodoListFiltersSchema`
  - [x] `shared/utils/date.ts` — `ISO_DATE_REGEX`, `isIsoDate`(2/29 윤년 검증 포함), `formatIsoDate`, `today()`
- **산출물**: `features/auth/auth.schemas.ts`, `features/users/users.schemas.ts`, `features/todos/todos.schemas.ts`, `features/categories/categories.schemas.ts`, `shared/utils/date.ts`, `features/__tests__/schemas.test.ts`, `shared/utils/__tests__/date.test.ts`
- **검증**: `npm test` 97 tests passed (스키마 29건 — Login/Register 비밀번호 확인·refine, UpdateProfile 4가지 케이스, Withdraw, CreateTodo UUID/제목/dueDate 형식, UpdateTodo nullable, TodoListFilters from>to 실패·단독 허용, Category 최대길이 + date 유틸 6건 — regex/유효성/윤년/존재하지 않는 날짜/포맷/today fake timer) / `npm run lint` 0 errors / `npm run build` 성공
- **참고**: SCN-04, SCN-02

---

### Task FE-07: SCR-01 로그인 / SCR-02 회원가입 — ✅ 완료 (2026-05-13)

- **목표**: 로그인/회원가입 화면.
- **담당 영역**: Frontend
- **예상 소요**: 2.5시간
- **의존성**: FE-03~06, BE-07 완료 필요
- **완료 조건 (체크박스)**:
  - [x] SCR-01: 이메일·비밀번호 폼, 로그인하기 버튼, 회원가입 링크 (`Link to="/register"`), `noValidate`로 브라우저 검증 비활성화 후 zod로 일원화
  - [x] 로그인 성공 시 `setToken(accessToken, user)` 후 `navigate('/todos')`
  - [x] 로그인 실패(401) 시 친화적 문구 — "이메일 또는 비밀번호가 올바르지 않습니다." + 비밀번호 필드 자동 초기화 (SCN-12)
  - [x] SCR-02: 이름·이메일·비밀번호·비밀번호 확인 + zod 실시간 검증 (`onChange`마다 `RegisterSchema.safeParse`)
  - [x] 회원가입 성공 시 `/login` 이동 + `location.state.registered`로 안내 배너 표시
  - [x] 중복 이메일(409 `EMAIL_DUPLICATED`) 인라인 오류 — 이메일 필드 하단 "이미 사용 중인 이메일입니다."
  - [x] 비밀번호 show/hide 토글 — `PasswordInput` 공통 컴포넌트 (`aria-pressed`, `aria-label` 토글)
- **산출물**: `features/auth/api/auth-api.ts`, `features/auth/hooks/use-{login,register}.ts`, `features/auth/components/{LoginForm,RegisterForm}.tsx`, `shared/components/PasswordInput.tsx`, `pages/{LoginPage,RegisterPage}.tsx`, `features/auth/components/__tests__/{LoginForm,RegisterForm}.test.tsx`, `src/test-setup.ts` (jest-dom 매처 + 자동 cleanup)
- **검증**: `npm test` 107 tests passed (LoginForm 5건 — 이메일 형식 인라인 오류·성공→ /todos 이동·401 친화 문구+비밀번호 초기화·회원가입 링크 이동·show/hide 토글 + RegisterForm 5건 — 실시간 비밀번호 불일치/8자 미만·성공→ /login+배너·409 인라인 오류·show/hide 토글) / `npm run lint` 0 errors / `npm run build` 366.53kB 성공
- **참고**: FR-01, FR-02, SCR-01/02, SCN-01/11/12

---

### Task FE-08: SCR-03 할일 목록 + 복합 필터 — ✅ 완료 (2026-05-13)

- **목표**: 할일 카드 목록 + 3개 필터 즉시 갱신.
- **담당 영역**: Frontend
- **예상 소요**: 3시간
- **의존성**: FE-03~05, BE-10/11/09 완료 필요
- **완료 조건 (체크박스)**:
  - [x] 기본 정렬 카드 목록 렌더링 — 백엔드 `created_at DESC`, `TodoCard`로 제목/카테고리/마감일 표시, 완료 항목은 `line-through` 스타일
  - [x] 필터 바 — 카테고리 select / 완료 여부 라디오(전체/완료/미완료) / 종료예정일 from-to date input
  - [x] 필터 변경 시 queryKey 변경으로 즉시 재호출 — `todosQueryKey(filters)` 직렬화, TanStack Query가 자동 refetch
  - [x] `dueDateFrom > dueDateTo` 시 클라이언트 차단 — `FilterBar` 내부 검증, 인라인 `filter-range-error` 메시지 + `onChange` 미호출
  - [x] 빈 결과 시 빈 상태 UI — 필터 미적용 시 "첫 번째 할일을 등록해 보세요!", 필터 적용 시 "해당 조건에 맞는 할일이 없습니다." + 필터 초기화 버튼
  - [x] 필터 초기화 버튼 — `setFilters({})`, FilterBar 우상단 + 빈 상태 내부 2곳 노출
  - [x] 본인 할일만 표시 (BR-U3) — 백엔드 미들웨어에서 `WHERE user_id = $1` 강제, 프론트는 JWT만 부착
  - [x] 네비게이션 — `AppHeader` 컴포넌트 (할일 목록 / 카테고리 / 마이페이지 Link + 로그아웃 버튼) — 로그아웃 시 `clearToken()` + `navigate('/login')`
- **산출물**: `features/todos/api/todos-api.ts`, `features/todos/hooks/use-todos.ts`, `features/categories/api/categories-api.ts`, `features/categories/hooks/use-categories.ts`, `features/todos/components/{FilterBar,TodoCard}.tsx`, `shared/components/AppHeader.tsx`, `pages/TodoListPage.tsx`, `features/todos/components/__tests__/FilterBar.test.tsx`, `pages/__tests__/TodoListPage.test.tsx`
- **검증**: `npm test` 119 tests passed (신규 12건: FilterBar 4 — 카테고리/완료여부 controlled 전환/from>to 차단/초기화, TodoListPage 8 — 초기 렌더·카테고리 필터 refetch·완료 필터 params 전달·빈 상태 2종·네비게이션·로그아웃·서버 오류 UI) / `npm run lint` 0 errors / `npm run build` 381.00kB 성공
- **참고**: FR-08/09, SCR-03, SCN-04

---

### Task FE-09: SCR-04 등록/수정 모달 + 완료 토글 + 삭제 — ✅ 완료 (2026-05-13)

- **목표**: 할일 모달 + 완료 토글 + 삭제 확인.
- **담당 영역**: Frontend
- **예상 소요**: 3시간
- **의존성**: FE-08, BE-10
- **완료 조건 (체크박스)**:
  - [x] 모달 — 제목/설명/마감일/카테고리 + zod (`CreateTodoSchema`로 검증, `noValidate` form)
  - [x] 등록 모드(빈 폼, 기본 카테고리 첫 항목 선택) / 수정 모드(`useEffect`로 프리필)
  - [x] 저장 성공 시 `invalidateQueries({queryKey: ['todos']})`로 목록 갱신, onClose 호출
  - [x] 완료 토글 한 번 클릭 (BR-T3) — `onMutate` 낙관적 업데이트로 즉시 UI 반영, PATCH `/todos/:id/complete` 발사
  - [x] 완료 시 취소선 스타일 (`textDecoration: line-through`)
  - [x] 삭제 → `ConfirmDialog`(2-step 확인) → DELETE → 목록 제거 (mutation onSuccess invalidate)
  - [x] 네트워크 오류 시 토글 UI 롤백 — `onError`에서 onMutate snapshot 복원
- **산출물**: `features/todos/hooks/use-todo-mutations.ts` (create/update/toggle 낙관적/delete), `features/todos/components/TodoModal.tsx`, `features/todos/components/TodoCard.tsx`(토글/수정/삭제 핸들러), `shared/components/ConfirmDialog.tsx`(Esc 키 cancel + aria-modal), `pages/TodoListPage.tsx`(modal/dialog state), `features/todos/components/__tests__/TodoModal.test.tsx`, `pages/__tests__/TodoListPage.interactions.test.tsx`
- **검증**: `npm test` 134 tests passed (신규 15건: TodoModal 8 — open/등록·수정 모드/zod 인라인/POST·PATCH/서버 오류/취소, Interactions 7 — 모달 오픈·수정 프리필·토글 즉시 반영·토글 서버 오류 시 롤백·삭제 확인 후 DELETE·삭제 취소·빈상태에서 추가 버튼) / `npm run lint` 0 errors / `npm run build` 387.26kB 성공
- **참고**: FR-07/11/12/13, SCN-02/05/06/07

---

### Task FE-10: SCR-05 카테고리 관리 — ✅ 완료 (2026-05-13)

- **목표**: 카테고리 CRUD 화면.
- **담당 영역**: Frontend
- **예상 소요**: 2시간
- **의존성**: FE-05, FE-08, BE-09
- **완료 조건 (체크박스)**:
  - [x] 기본 카테고리 수정/삭제 버튼 `disabled` (BR-C1) + "기본" 뱃지
  - [x] "기본 카테고리는 변경할 수 없습니다" 툴팁 — `title` 속성으로 hover 시 표시
  - [x] 사용자 카테고리 수정/삭제 활성 — 인라인 편집(저장/취소) + 삭제 확인 다이얼로그
  - [x] 추가 입력 + "추가" 버튼, 빈 이름 차단 — `CreateCategorySchema` 클라이언트 검증으로 사전 차단
  - [x] 중복 이름(409 `CATEGORY_NAME_DUPLICATED`) "이미 사용 중" 친화 오류 — 추가/수정 모두에서 매핑
  - [x] 삭제 시 연결 할일(409 `CATEGORY_HAS_TODOS`) 오류 (BR-C4) — "이 카테고리에 연결된 할일이 있어 삭제할 수 없습니다."
  - [x] CRUD 성공 시 목록 즉시 갱신 — `invalidateQueries({queryKey: categoriesQueryKey})` (삭제 시 `['todos']`도 함께 invalidate)
- **산출물**: `features/categories/hooks/use-category-mutations.ts`, `features/categories/components/{CategoryForm,CategoryRow}.tsx`, `pages/CategoriesPage.tsx`, `pages/__tests__/CategoriesPage.test.tsx`
- **검증**: `npm test` 143 tests passed (CategoriesPage 신규 9건: 기본/사용자 분리·기본 disabled+툴팁·사용자 활성·빈 이름 차단·추가 성공 후 입력 초기화·중복 409 친화 오류·수정 PATCH·삭제 시 연결 할일 409·삭제 성공 시 제거+빈 상태) / `npm run lint` 0 errors / `npm run build` 391.60kB 성공
- **참고**: FR-14~17, SCR-05, SCN-03/08/15

---

### Task FE-11: SCR-06 마이페이지 (개인정보 + 회원 탈퇴) — ✅ 완료 (2026-05-13)

- **목표**: 개인정보 수정 + 2단계 확인 회원 탈퇴.
- **담당 영역**: Frontend
- **예상 소요**: 2시간
- **의존성**: FE-05, FE-06, BE-08
- **완료 조건 (체크박스)**:
  - [x] `GET /api/users/me`로 현재 정보 로드 — `useMe()` (queryKey `['users','me']`), 로드 후 이메일 readonly + 이름 프리필
  - [x] 이름 수정 + 비밀번호 변경(현재 PW → 새 PW → 확인) 폼 — `ProfileForm` 단일 폼에서 통합, 변경된 필드만 PATCH 페이로드에 포함
  - [x] 비밀번호 show/hide 토글 — 공용 `PasswordInput` 3개(현재/새/새 확인) 적용
  - [x] 새 PW 불일치 시 클라이언트 오류 — `UpdateProfileSchema`의 refine으로 API 호출 전 차단
  - [x] 현재 PW 불일치(401 `INVALID_CURRENT_PASSWORD`) 시 인라인 오류 — "현재 비밀번호가 올바르지 않습니다." (currentPassword 필드 하단)
  - [x] 수정 성공 시 토스트 — 3초 자동 사라짐 (`profile-toast` role=status)
  - [x] 회원 탈퇴 → 2단계 확인 다이얼로그 (OI-04) — `WithdrawSection` 내 dialog: "탈퇴합니다" 정확 입력 + 현재 비밀번호 모두 충족 시에만 확인 버튼 활성화
  - [x] 탈퇴 확인 시 DELETE → `clearToken()` → `/login` + `state.withdrawn` 안내
- **산출물**: `features/users/api/users-api.ts`, `features/users/hooks/use-me.ts`, `features/users/components/{ProfileForm,WithdrawSection}.tsx`, `pages/MyPage.tsx`, `pages/__tests__/MyPage.test.tsx`, `routes/__tests__/routes.test.tsx`(catch-all MockAdapter 추가)
- **검증**: `npm test` 151 tests passed (MyPage 신규 8건: 프리필·이름 수정 토스트·새 PW 확인 불일치 클라이언트 차단·비밀번호 변경 성공·401 인라인·탈퇴 문구+비밀번호 입력 후 DELETE+토큰 초기화+/login 이동·확인 문구만 입력 시 disabled·탈퇴 401 인라인 오류) / `npm run lint` 0 errors / `npm run build` 397.80kB 성공
- **참고**: FR-04/05, SCR-06, SCN-09/10

---

### Task FE-12: 반응형 UI 검증 + 에러 메시지 표준화 — ✅ 완료 (2026-05-13)

- **목표**: 3개 Breakpoint 검증 + 사용자 친화 에러 문구 통일.
- **담당 영역**: Frontend
- **예상 소요**: 2시간
- **의존성**: FE-07~11
- **완료 조건 (체크박스)**:
  - [x] Mobile(<768px): 1열 세로(컨테이너 padding 축소), FAB(+) — `add-todo-btn` fixed bottom-right 56×56, 가로 스크롤 차단(`overflow-x: hidden`)
  - [x] Tablet(768~1023) / Desktop(≥1024): max-width 720px/960px로 여백 조정, breakpoint별 미디어쿼리 분리
  - [x] 터치 타깃 ≥ 44×44px (SCN-14) — `--touch-target-min: 44px` 변수 + button/input min-height/min-width 적용
  - [x] 모달이 모바일 키보드에 가려지지 않음 — `max-height: calc(100dvh - 24px)` + `overflow: auto` (dvh: 키보드 노출 시 viewport 자동 축소)
  - [x] HTTP 상태 코드 화면 노출 금지 — `toUserMessage`가 code → 한국어 문구만 반환, 정적 테스트로 어떤 매핑에서도 3자리 숫자 미노출 검증
  - [x] API 에러 → 친화 문구 매핑을 `shared/utils/error-message.ts`에 일괄 관리 (auth/user/todo/category/network 12개 코드 + fallback), 컴포넌트는 `toUserMessage(err)` 호출만
  - [x] 네트워크 단절 시 공통 메시지 — `NETWORK_ERROR`/`TIMEOUT` 모두 "잠시 후 다시 시도해 주세요." 안내로 통일
  - [x] 색상값 CSS 변수화 (2차 다크모드 대비) — `--color-bg/text/text-muted/border/primary/danger/success/warning/focus-ring` 정의, 하드코딩 hex 사용 컴포넌트에는 향후 변수 전환 (1차는 인라인 스타일 최소화)
- **산출물**: `shared/utils/error-message.ts`, `styles/global.css`, `main.tsx`(global.css import), `shared/utils/__tests__/error-message.test.ts` (TodoModal·TodoListPage에서 `toUserMessage` 적용)
- **검증**: `npm test` 163 tests passed (error-message 신규 12건: 12개 코드 매핑·fallback·plain object/null/Error 처리·3자리 숫자 미노출 정적 검증·toFieldMessage 3건 + global.css 정적 검증 2건 — CSS 변수 존재, 3개 breakpoint 미디어쿼리 존재) / `npm run lint` 0 errors / `npm run build` 398.54kB + 2.77kB CSS 성공
- **참고**: PRD 9.1/9.3, SCN-11/12/14/15, 구조 원칙 12장

---

### 프론트엔드 영역 요약 표

| Task ID | 제목                            | 소요 | 의존성              | Day   |
| ------- | ------------------------------- | ---- | ------------------- | ----- |
| FE-01   | 프로젝트 초기화                 | 1.5h | 없음                | Day 1 |
| FE-02   | 디렉토리 / 공통 타입            | 1h   | FE-01               | Day 1 |
| FE-03   | axios + 인터셉터                | 1.5h | FE-01, FE-02        | Day 1 |
| FE-04   | useAuthStore + QueryClient      | 1h   | FE-01, FE-02        | Day 1 |
| FE-05   | Router + Protected Route        | 1h   | FE-04               | Day 1 |
| FE-06   | zod 스키마 + 유틸               | 1h   | FE-02               | Day 1 |
| FE-07   | SCR-01 로그인 / SCR-02 회원가입 | 2.5h | FE-03~06, BE-07     | Day 1 |
| FE-08   | SCR-03 할일 목록 + 필터         | 3h   | FE-03~05, BE-09~11  | Day 2 |
| FE-09   | SCR-04 모달 + 토글 + 삭제       | 3h   | FE-08, BE-10        | Day 2 |
| FE-10   | SCR-05 카테고리 관리            | 2h   | FE-05, FE-08, BE-09 | Day 2 |
| FE-11   | SCR-06 마이페이지               | 2h   | FE-05, FE-06, BE-08 | Day 3 |
| FE-12   | 반응형 + 에러 표준화            | 2h   | FE-07~11            | Day 3 |

**총 예상 소요**: 약 **21.5시간**

---

## 7. 영역 간 의존성 매트릭스

| FE Task                  | 요구 BE Task        | 요구 DB Task |
| ------------------------ | ------------------- | ------------ |
| FE-07 (로그인/회원가입)  | BE-07               | DB-02, DB-06 |
| FE-08 (할일 목록 + 필터) | BE-09, BE-10, BE-11 | DB-02, DB-05 |
| FE-09 (모달/토글/삭제)   | BE-10               | DB-02        |
| FE-10 (카테고리 관리)    | BE-09               | DB-02, DB-03 |
| FE-11 (마이페이지/탈퇴)  | BE-08               | DB-02, DB-04 |

### 병렬화 가이드

- **Day 1**: DB-01 → DB-02/03/04/05/06 + BE-01~07 + FE-01~07 가 **상당 부분 병렬** 가능
- **Day 2**: BE-08~11과 FE-08~10이 각 BE Task 완료 후 즉시 FE 진행 (수직적 파이프라인)
- **Day 3**: BE-12/14, FE-11/12 병렬

---

## 8. 리스크와 절충안

### 8.1 일정 위기 시 후순위 이동 권장

| 후순위 권장 Task                 | 이유                                 |
| -------------------------------- | ------------------------------------ |
| BE-12 (Service 단위 테스트)      | Must 기능 검증을 수동 QA로 대체 가능 |
| BE-14 (부하 테스트)              | 출시 후 별도 검증 가능               |
| DB-07 (마이그레이션 분리)        | schema.sql 단일 파일로도 운영 가능   |
| FE-10 일부 (FR-16 카테고리 수정) | 삭제 후 재생성으로 대체              |
| FE-11 일부 (비밀번호 변경)       | 출시 후 보강 가능                    |

### 8.2 핵심 리스크 (PRD 12.1 참조)

- **R-01 일정 초과** (높음/중): 위 절충안 적용
- **R-02 pg Raw SQL 복잡도** (중/높음): BE-11 동적 필터 빌더 우선 작성
- **R-05 CASCADE 미설정** (낮음/높음): DB-04에서 명시적 검증
- **R-06 동시접속 300명**: BE-14 부하 테스트

### 8.3 미결 사항 (PRD 13장)

- **OI-01 카테고리 삭제 정책**: DB-04에서 RESTRICT 기본값 확인
- **OI-02 기본 카테고리 초기값**: DB-03에서 종결
- **OI-04 회원 탈퇴 UX**: FE-11에서 2단계 확인 채택
- **OI-05 배포 인프라**: Day 0 또는 Day 1 확정 필요

---

## 9. 변경 이력

| 버전 | 날짜       | 작성자            | 변경 내용                                                                          |
| ---- | ---------- | ----------------- | ---------------------------------------------------------------------------------- |
| 1.0  | 2026-05-13 | Execution Planner | 초안 — DB 7개 / BE 14개 / FE 12개 Task 분해, Day-by-Day 일정, 의존성 매트릭스 작성 |

---

_본 문서는 docs/ 디렉토리의 모든 상위 문서(도메인 정의서 v0.2, PRD v1.2, 사용자 시나리오 v1.1, 구조 원칙 v1.1, 아키텍처 v1.2, ERD v1.0, UC)를 기반으로 작성되었으며, 상위 문서 변경 시 본 실행계획도 함께 업데이트되어야 한다._
