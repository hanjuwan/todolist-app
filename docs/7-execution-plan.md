# 실행계획 (Execution Plan) — TodoListApp

> **버전:** 1.0
> **작성일:** 2026-05-13
> **기반 문서:**
> - 도메인 정의서 v0.2 (`1-domain-definition.md`)
> - PRD v1.2 (`2-prd.md`)
> - 사용자 시나리오 v1.1 (`3-user-scenario.md`)
> - 프로젝트 구조 설계 원칙 v1.1 (`4-project-structure-principles.md`)
> - 아키텍처 다이어그램 v1.2 (`5-arch-diagram.md`)
> - ERD v1.0 (`6-erd.md`)
> - UC 다이어그램 (`99-uc.md`)
> **상태:** 초안 (Draft)

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

| Day | DB | Backend | Frontend |
|-----|----|---------|----------|
| **Day 1 (2026-05-13)** | DB-01~06 (환경, 스키마, 시드, FK, 인덱스, .env+Pool) | BE-01~07 + BE-13 골격 (초기화, Pool, env, 에러/JWT/zod 미들웨어, Auth 모듈) | FE-01~07 (초기화, 디렉토리, axios, Zustand, Router, zod, 로그인/회원가입) |
| **Day 2 (2026-05-14)** | — | BE-08~11 (User, Category, Todo, 필터 빌더) | FE-08~10 (할일 목록+필터, 모달+토글+삭제, 카테고리 관리) |
| **Day 3 (2026-05-15)** | DB-07 (선택, 마이그레이션 정책) | BE-12, BE-13 최종, BE-14 (테스트, 미들웨어 조립, 부하 테스트) | FE-11, FE-12 (마이페이지, 반응형/에러 표준화) |

---

## A. 데이터베이스 (Database)

### Task DB-01: PostgreSQL 17 환경 준비

- **목표**: 로컬 또는 Docker 기반 PostgreSQL 17 인스턴스를 실행하고 애플리케이션 전용 DB를 생성한다.
- **담당 영역**: DB
- **예상 소요**: 30분
- **의존성**: 없음
- **완료 조건 (체크박스)**:
  - [ ] `psql --version` 출력이 PostgreSQL 17.x 임을 확인한다 (또는 `docker ps`에서 postgres:17 컨테이너가 Up 상태)
  - [ ] `todoapp` 데이터베이스가 존재하고 지정 유저로 접속 가능하다 (`psql -U <user> -d todoapp` 성공)
  - [ ] 선택 방식(로컬 설치 vs Docker Compose)이 `README` 또는 팀 내 문서로 공유된다
- **산출물**: 실행 중인 PostgreSQL 17 인스턴스, `todoapp` 데이터베이스
- **참고**: `.env.example`의 `PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE`와 일치 (구조 원칙 7.1)
- **권장 일정**: Day 1 오전 최우선

---

### Task DB-02: schema.sql 실행 및 스키마 생성 검증

- **목표**: `database/schema.sql`을 대상 DB에 실행하여 3개 테이블(`users`, `categories`, `todos`)과 모든 제약조건이 정상 생성됨을 검증한다.
- **담당 영역**: DB
- **예상 소요**: 20분
- **의존성**: DB-01 완료 필요
- **완료 조건 (체크박스)**:
  - [ ] `psql -f database/schema.sql` 실행이 오류 없이 완료된다
  - [ ] `\dt` 결과에 `users`, `categories`, `todos` 3개 테이블이 모두 존재한다
  - [ ] `\d users` / `\d categories` / `\d todos` 로 각 테이블의 컬럼·타입·NOT NULL·DEFAULT 값이 ERD v1.0 4장 명세와 일치함을 육안 확인한다
  - [ ] `UNIQUE (email)`, `PRIMARY KEY`, `FOREIGN KEY` 제약이 `\d+ <table>` 출력에서 모두 확인된다
  - [ ] 스크립트 재실행(`IF NOT EXISTS` / `ON CONFLICT DO NOTHING`)이 오류 없이 통과된다 (멱등성 확인)
- **산출물**: `database/schema.sql` (이미 존재, 실행 검증만)
- **참고**: R-05 리스크 대응
- **권장 일정**: Day 1 오전 (DB-01 직후)

---

### Task DB-03: 기본 카테고리 시드 데이터 검증

- **목표**: schema.sql에 포함된 INSERT 구문으로 기본 카테고리 4건이 정확히 삽입되었는지 검증하고 OI-02를 종결한다.
- **담당 영역**: DB
- **예상 소요**: 15분
- **의존성**: DB-02 완료 필요
- **완료 조건 (체크박스)**:
  - [ ] `SELECT * FROM categories WHERE is_default = true;` 결과가 정확히 4건(업무, 개인, 학습, 기타)이다
  - [ ] 4건 모두 `user_id IS NULL`, `is_default = true` 조건을 만족한다
  - [ ] 스크립트 재실행 후에도 중복 삽입 없이 여전히 4건임을 확인한다
  - [ ] OI-02 종결 처리
- **산출물**: 검증 완료된 시드 데이터
- **참고**: ERD v1.0 7장
- **권장 일정**: Day 1 오전

---

### Task DB-04: 외래키 ON DELETE CASCADE / RESTRICT 동작 테스트

- **목표**: `users` 삭제 시 CASCADE, `categories` 삭제 시 RESTRICT가 정확히 작동함을 DML로 검증 (BR-U4, OI-01).
- **담당 영역**: DB
- **예상 소요**: 30분
- **의존성**: DB-03 완료 필요
- **완료 조건 (체크박스)**:
  - [ ] 테스트 유저 1건 + 사용자 정의 카테고리 1건 + 할일 2건을 직접 INSERT한다
  - [ ] `DELETE FROM users WHERE id = '<test_user_id>'` 실행 후, 해당 유저의 `todos`와 사용자 정의 `categories`가 자동 삭제되고 기본 카테고리는 보존됨을 확인 (BR-U4)
  - [ ] 할일이 연결된 카테고리 삭제 시 FK violation 오류 발생 확인 (RESTRICT, BR-C4)
  - [ ] 할일이 없는 사용자 정의 카테고리는 정상 삭제됨을 확인
  - [ ] 테스트 임시 데이터 정리
- **산출물**: (선택) `database/tests/fk_cascade_test.sql`
- **참고**: PRD 10.3, R-05, OI-01 DB 기본값 확인
- **권장 일정**: Day 1 오후

---

### Task DB-05: 인덱스 생성 확인 및 EXPLAIN 검증

- **목표**: 필수 인덱스 5종 생성 확인 및 주요 쿼리 패턴에 대해 Index Scan 사용 검증.
- **담당 영역**: DB
- **예상 소요**: 30분
- **의존성**: DB-03 완료 필요
- **완료 조건 (체크박스)**:
  - [ ] `\di todos*` / `\di categories*` 결과에 ERD v1.0 6장의 5개 인덱스가 모두 존재한다
  - [ ] `EXPLAIN SELECT * FROM todos WHERE user_id = $1`에서 Index Scan 확인
  - [ ] 복합 인덱스 `(user_id, is_completed)` 활용 확인
  - [ ] 복합 인덱스 `(user_id, due_date)` 활용 확인
  - [ ] `idx_todos_category_id` 활용 확인
- **산출물**: EXPLAIN 결과 기록
- **참고**: PRD 3.2 (P95 < 500ms KPI)
- **권장 일정**: Day 1 오후

---

### Task DB-06: .env DB 연결 정보 정의 및 pg Connection Pool 설정

- **목표**: `.env` / `.env.example`에 DB 연결 환경변수를 정의하고, 백엔드 `db/pool.ts`에서 정상 동작 확인.
- **담당 영역**: DB / 백엔드 연결
- **예상 소요**: 30분
- **의존성**: DB-01 완료 필요
- **완료 조건 (체크박스)**:
  - [ ] `.env.example`에 `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `DATABASE_URL`(선택) 항목 존재
  - [ ] `backend/src/config/env.ts`에서 환경변수 로드·검증 후 type-safe 객체 노출
  - [ ] `backend/src/db/pool.ts`가 단일 `pg.Pool` 인스턴스 export, `max: 20` 포함
  - [ ] 서버 기동 시 `pool.query('SELECT 1')` 헬스체크 성공 로그
  - [ ] `.env`가 `.gitignore`에 등록, `.env.example`만 커밋
- **산출물**: `backend/src/db/pool.ts`, `backend/src/config/env.ts`, `.env.example`
- **참고**: PRD 7.3, R-04, R-06
- **권장 일정**: Day 1 (BE-02와 통합 가능)

---

### Task DB-07: 마이그레이션 운영 정책 수립 및 파일 분리

- **목표**: `schema.sql`을 단계별 마이그레이션 파일로 분리하고 정책을 문서화.
- **담당 영역**: DB
- **예상 소요**: 30분
- **의존성**: DB-02 완료 필요
- **완료 조건 (체크박스)**:
  - [ ] `database/migrations/` 디렉토리에 3개 파일 존재 (init_users / init_categories / init_todos)
  - [ ] `database/seeds/20260513_0001_default_categories.sql` 존재
  - [ ] 파일 명명 규칙 `{YYYYMMDD}_{NNNN}_{snake_case}.sql` 준수 (구조 원칙 10.3)
  - [ ] 순서대로 실행 시 schema.sql 단일 실행과 동일한 결과
  - [ ] 실행 순서가 README 또는 코드 주석에 명시
- **산출물**: `database/migrations/*.sql`, `database/seeds/*.sql`
- **참고**: 구조 원칙 10.3, MVP 단계에서는 선택
- **권장 일정**: Day 1 말~Day 3 (선택)

---

### DB 영역 요약 표

| Task ID | 제목 | 소요 | 의존성 | Day |
|---|---|---|---|---|
| DB-01 | PostgreSQL 17 환경 준비 | 30분 | 없음 | Day 1 |
| DB-02 | schema.sql 실행 및 검증 | 20분 | DB-01 | Day 1 |
| DB-03 | 기본 카테고리 시드 검증 | 15분 | DB-02 | Day 1 |
| DB-04 | ON DELETE CASCADE/RESTRICT 테스트 | 30분 | DB-03 | Day 1 |
| DB-05 | 인덱스 / EXPLAIN 검증 | 30분 | DB-03 | Day 1 |
| DB-06 | .env / Connection Pool 설정 | 30분 | DB-01 | Day 1 |
| DB-07 | 마이그레이션 정책 (선택) | 30분 | DB-02 | Day 1말~Day 3 |

**필수(DB-01~06) 총 소요**: 약 **2시간 35분**

---

## B. 백엔드 (Backend)

### Task BE-01: 프로젝트 초기화 및 디렉토리 구조 셋업

- **목표**: Node.js + Express + TypeScript 백엔드 프로젝트를 구조 원칙에 맞게 초기화.
- **담당 영역**: Backend
- **예상 소요**: 1시간
- **의존성**: 없음
- **완료 조건 (체크박스)**:
  - [ ] `backend/` 루트에 `package.json`, `tsconfig.json` (`strict: true`)
  - [ ] `npm run dev` 실행 시 Express 서버 기동 확인
  - [ ] `src/modules/{auth,users,todos,categories}/`, `src/middlewares/`, `src/db/`, `src/config/`, `src/utils/` 생성
  - [ ] ESLint + Prettier 설정 + 린트 통과
  - [ ] `.env.example`에 `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_ACCESS_TOKEN_TTL`, `BCRYPT_COST`, `CORS_ORIGIN`, `NODE_ENV` 포함
  - [ ] `.gitignore`에 `.env`, `node_modules/`, `dist/` 포함
- **산출물**: `backend/package.json`, `tsconfig.json`, `src/app.ts`, `src/server.ts`, `.env.example`
- **참고**: 구조 원칙 9.1, 11.3

---

### Task BE-02: pg Connection Pool 설정

- **목표**: `pg.Pool` 단일 인스턴스 + graceful shutdown.
- **담당 영역**: Backend
- **예상 소요**: 30분
- **의존성**: BE-01
- **완료 조건 (체크박스)**:
  - [ ] `src/db/pool.ts`에서 `new Pool({ ... })` 단일 인스턴스 export
  - [ ] `max: 20` 설정
  - [ ] 서버 기동 시 `pool.query('SELECT 1')` 성공 로그
  - [ ] SIGTERM 수신 시 `pool.end()` 호출
  - [ ] Repository 외 다른 레이어에서 pool 직접 import 불가 확인
- **산출물**: `backend/src/db/pool.ts`
- **참고**: PRD 7.3, 구조 원칙 9.3

---

### Task BE-03: 환경변수 / 설정 모듈

- **목표**: `process.env` 일괄 로드·검증 후 type-safe 객체 노출.
- **담당 영역**: Backend
- **예상 소요**: 30분
- **의존성**: BE-01
- **완료 조건 (체크박스)**:
  - [ ] `src/config/env.ts`에서 필수 환경변수 누락 시 기동 시점 예외 throw
  - [ ] `BCRYPT_COST` < 12 이면 기동 거부
  - [ ] 전체 환경변수가 TypeScript 타입으로 정의됨
  - [ ] `src/server.ts` 외 파일에서 `process.env.*` 직접 참조 없음
- **산출물**: `backend/src/config/env.ts`
- **참고**: PRD 7.2, 구조 원칙 7.1

---

### Task BE-04: 에러 미들웨어 + 표준 에러 응답 스키마

- **목표**: 통합 에러 핸들러 + 일관된 JSON 에러 응답.
- **담당 영역**: Backend
- **예상 소요**: 1시간
- **의존성**: BE-01
- **완료 조건 (체크박스)**:
  - [ ] `src/middlewares/error.middleware.ts` 구현
  - [ ] 응답 스키마 `{ success: false, error: { code, message } }`
  - [ ] `AppError` 클래스 정의 (`statusCode`, `code`, `message`)
  - [ ] 운영 환경에서 DB 에러/스택트레이스 미노출
  - [ ] `src/utils/async-handler.ts`로 async route wrapping
  - [ ] 404 응답 처리 확인
- **산출물**: `error.middleware.ts`, `async-handler.ts`
- **참고**: PRD 7.5, 구조 원칙 9.2

---

### Task BE-05: JWT 인증 미들웨어

- **목표**: `Authorization: Bearer <token>` 검증 + `req.user` 주입.
- **담당 영역**: Backend
- **예상 소요**: 1시간
- **의존성**: BE-03, BE-04
- **완료 조건 (체크박스)**:
  - [ ] `auth.middleware.ts` — 토큰 누락/무효/만료 시 401
  - [ ] `src/utils/jwt.ts`에 `signToken/verifyToken` wrapper (TTL = `env.jwtAccessTokenTtl`)
  - [ ] `req.user: { id: string }` 타입 선언 (`Express.Request` 확장)
  - [ ] 인증이 필요한 모든 라우터에 미들웨어 체이닝
- **산출물**: `auth.middleware.ts`, `utils/jwt.ts`
- **참고**: PRD 7.2 (JWT TTL 1시간), FR-06, BR-U3

---

### Task BE-06: zod 검증 유틸 / 공통 validator

- **목표**: 서버 사이드 zod 검증 미들웨어 팩토리 + 모듈별 스키마.
- **담당 영역**: Backend
- **예상 소요**: 1시간
- **의존성**: BE-01, BE-04
- **완료 조건 (체크박스)**:
  - [ ] `validate(schema)` 팩토리 — 실패 시 400 + 에러 필드 목록
  - [ ] auth 스키마: Register, Login
  - [ ] users 스키마: UpdateProfile
  - [ ] todos 스키마: CreateTodo, UpdateTodo
  - [ ] categories 스키마: CreateCategory, UpdateCategory
  - [ ] 검증 실패 응답이 BE-04 스키마와 일치
- **산출물**: 각 모듈의 `*.validator.ts`
- **참고**: PRD 7.2

---

### Task BE-07: Auth 모듈 — 회원가입 / 로그인 / 로그아웃

- **목표**: 회원가입, 로그인(JWT 발급), 로그아웃 3개 API.
- **담당 영역**: Backend
- **예상 소요**: 2시간
- **의존성**: BE-02, BE-05, BE-06
- **완료 조건 (체크박스)**:
  - [ ] `POST /api/auth/register` — 중복 시 409, 성공 시 201 (bcrypt cost ≥ 12)
  - [ ] `POST /api/auth/login` — 불일치 시 401, 성공 시 200 + `{ accessToken, user }`
  - [ ] `POST /api/auth/logout` — 인증 미들웨어 적용, 200 반환
  - [ ] `utils/password.ts`에 `hashPassword/comparePassword`
  - [ ] Repository 모든 쿼리 Parameterized Query
  - [ ] 응답에 `password_hash` 절대 미포함
- **산출물**: `modules/auth/auth.{router,service}.ts`, `modules/users/users.repository.ts`, `utils/password.ts`
- **참고**: FR-01~03, BR-U1, BR-U2

---

### Task BE-08: User 모듈 — 내 정보 / 회원 탈퇴(트랜잭션)

- **목표**: 내 정보 조회·수정, 회원 탈퇴(CASCADE 하드 삭제 트랜잭션).
- **담당 영역**: Backend
- **예상 소요**: 2시간
- **의존성**: BE-05, BE-06, BE-07
- **완료 조건 (체크박스)**:
  - [ ] `GET /api/users/me` — `req.user.id` 기반, `password_hash` 미포함
  - [ ] `PATCH /api/users/me` — `currentPassword` 불일치 시 401, `updated_at` 갱신
  - [ ] `DELETE /api/users/me` — `BEGIN/COMMIT/ROLLBACK` 트랜잭션, CASCADE 자동 정리, 204
  - [ ] 실패 시 ROLLBACK + `client.release()` 보장
- **산출물**: `modules/users/users.{router,service,repository}.ts`
- **참고**: FR-04, FR-05, BR-U3, BR-U4, PRD 7.4

---

### Task BE-09: Category 모듈

- **목표**: 카테고리 CRUD API.
- **담당 영역**: Backend
- **예상 소요**: 1.5시간
- **의존성**: BE-05, BE-06
- **완료 조건 (체크박스)**:
  - [ ] `GET /api/categories` — `WHERE user_id = $1 OR user_id IS NULL`
  - [ ] `POST /api/categories` — 동일 사용자 내 중복 시 409 (BR-C3)
  - [ ] `PATCH /api/categories/:id` — `is_default=true` 시 403 (BR-C1)
  - [ ] `DELETE /api/categories/:id` — `is_default=true` 시 403; 연결 Todo 시 409 (BR-C4)
  - [ ] 모든 쿼리에 `WHERE user_id = $1`
  - [ ] 타 사용자 카테고리 접근 시 404
- **산출물**: `modules/categories/*.ts`
- **참고**: FR-14~17, BR-C1~C4

---

### Task BE-10: Todo 모듈 — CRUD + 완료/취소

- **목표**: 할일 CRUD + 완료 토글.
- **담당 영역**: Backend
- **예상 소요**: 2.5시간
- **의존성**: BE-05, BE-06, BE-09
- **완료 조건 (체크박스)**:
  - [ ] `POST /api/todos` — `user_id = req.user.id` 강제, 201
  - [ ] `GET /api/todos/:id` — 타 사용자 항목 404
  - [ ] `PATCH /api/todos/:id` — 완료된 항목도 수정 허용 (BR-T4)
  - [ ] `PATCH /api/todos/:id/complete` — `completed_at` 자동 설정/NULL 처리 (BR-T3)
  - [ ] `DELETE /api/todos/:id` — `WHERE id = $1 AND user_id = $2`, 204
  - [ ] 모든 Repository 메서드가 `userId` 인자 요구
- **산출물**: `modules/todos/*.ts`
- **참고**: FR-07, FR-10~13, BR-T1~T5, BR-U3

---

### Task BE-11: 할일 목록 동적 필터 SQL 빌더

- **목표**: 복합 필터를 안전한 Parameterized Query로 처리.
- **담당 영역**: Backend
- **예상 소요**: 1.5시간
- **의존성**: BE-10
- **완료 조건 (체크박스)**:
  - [ ] `buildFilterQuery(userId, filters)` — `WHERE user_id = $1` 고정 + 옵션 필터 동적 추가
  - [ ] 파라미터 인덱스 순차 누적 (SQL Injection 방지)
  - [ ] `category_id`, `due_date_from/to`, `is_completed` 독립/조합 테스트 통과
  - [ ] 필터 미적용 시 전체 목록 (기본 정렬 `created_at DESC`)
  - [ ] 쿼리 파라미터 파싱·zod 검증
  - [ ] 문자열 결합 SQL 사용 없음 (코드 리뷰)
- **산출물**: `modules/todos/todos.repository.ts`, `todos.validator.ts`
- **참고**: FR-08, FR-09, R-02

---

### Task BE-12: 단위 테스트 — Service 레이어 핵심 BR

- **목표**: 핵심 비즈니스 규칙을 Vitest로 검증.
- **담당 영역**: Backend
- **예상 소요**: 2시간
- **의존성**: BE-07~BE-11
- **완료 조건 (체크박스)**:
  - [ ] Vitest 또는 Jest 설정
  - [ ] `auth.service` — 중복 이메일 409, 잘못된 비밀번호 401
  - [ ] `auth.service` — 발급 토큰이 verifyToken으로 검증됨
  - [ ] `categories.service` — `is_default=true` 수정/삭제 403 (BR-C1)
  - [ ] `todos.service` — 완료/취소 시 `completed_at` 토글 (BR-T3)
  - [ ] `todos.repository` 필터 빌더 4가지 조합 SQL 파라미터 검증
- **산출물**: `__tests__/*.test.ts`
- **참고**: 구조 원칙 6.2, 6.6

---

### Task BE-13: 로깅 / CORS / 보안 헤더

- **목표**: 요청 로깅, CORS, JSON 파싱, 보안 헤더 미들웨어 조립.
- **담당 영역**: Backend
- **예상 소요**: 1시간
- **의존성**: BE-04
- **완료 조건 (체크박스)**:
  - [ ] `request-logger.middleware.ts` — `[METHOD] /path → STATUS ms` (민감정보 미로깅)
  - [ ] CORS — `CORS_ORIGIN` 환경변수, wildcard 금지
  - [ ] `express.json()` 적용
  - [ ] `helmet` 또는 수동 보안 헤더
  - [ ] 운영에서 HTTPS 강제 처리
  - [ ] `app.ts`에서 모든 모듈이 `/api/*`로 마운트
- **산출물**: `request-logger.middleware.ts`, `app.ts`
- **참고**: PRD 7.2, 7.5

---

### Task BE-14: 부하 테스트 — 300명 동시접속 P95 검증

- **목표**: JMeter/k6로 300 VU 부하 테스트, P95 < 500ms 확인.
- **담당 영역**: Backend
- **예상 소요**: 1.5시간
- **의존성**: BE-07~BE-13 전체
- **완료 조건 (체크박스)**:
  - [ ] 시나리오: login → GET /todos → POST /todos 플로우
  - [ ] 300 VU × 1분, HTTP 에러율 < 1%
  - [ ] P95 < 500ms 달성 (PRD 7.1)
  - [ ] pg Pool(max 20) 대기열 정상 동작 (커넥션 고갈 없음)
  - [ ] 결과 요약 기록
- **산출물**: `backend/load-test/`
- **참고**: PRD 3.2, 7.1, R-06

---

### 백엔드 영역 요약 표

| Task ID | 제목 | 소요 | 의존성 | Day |
|---|---|---|---|---|
| BE-01 | 프로젝트 초기화 | 1h | 없음 | Day 1 |
| BE-02 | pg Pool 설정 | 30분 | BE-01 | Day 1 |
| BE-03 | 환경변수 모듈 | 30분 | BE-01 | Day 1 |
| BE-04 | 에러 미들웨어 + 스키마 | 1h | BE-01 | Day 1 |
| BE-05 | JWT 인증 미들웨어 | 1h | BE-03, BE-04 | Day 1 |
| BE-06 | zod 검증 유틸 | 1h | BE-01, BE-04 | Day 1 |
| BE-07 | Auth 모듈 | 2h | BE-02, BE-05, BE-06 | Day 1 |
| BE-08 | User 모듈 (트랜잭션 탈퇴) | 2h | BE-05~07 | Day 2 |
| BE-09 | Category 모듈 | 1.5h | BE-05, BE-06 | Day 2 |
| BE-10 | Todo 모듈 | 2.5h | BE-05, BE-06, BE-09 | Day 2 |
| BE-11 | 동적 필터 SQL 빌더 | 1.5h | BE-10 | Day 2 |
| BE-12 | Service 단위 테스트 | 2h | BE-07~11 | Day 3 |
| BE-13 | 로깅/CORS/보안 헤더 | 1h | BE-04 | Day 1 골격 / Day 3 마무리 |
| BE-14 | 부하 테스트 | 1.5h | BE-07~13 | Day 3 |

**총 예상 소요**: 약 **21시간**

---

## C. 프론트엔드 (Frontend)

### Task FE-01: 프로젝트 초기화 및 개발 환경

- **목표**: React 19 + TypeScript + Vite 기반 초기화.
- **담당 영역**: Frontend
- **예상 소요**: 1.5시간
- **의존성**: 없음
- **완료 조건 (체크박스)**:
  - [ ] Vite로 React 19 + TS 프로젝트 생성
  - [ ] `tsconfig.json` strict 모드
  - [ ] ESLint + Prettier 설정 + lint 통과
  - [ ] `npm run lint`, `npm run build` 성공
  - [ ] `.env.example`, `.gitignore` 작성
  - [ ] `vite.config.ts`에 `@/` alias 설정
- **산출물**: `frontend/vite.config.ts`, `tsconfig.json`, `.eslintrc.*`, `.prettierrc`
- **참고**: PRD 8.1, 구조 원칙 6.4

---

### Task FE-02: Feature 디렉토리 / 공통 타입 셋업

- **목표**: Feature 기반 폴더 + shared/lib/pages + 공통 타입.
- **담당 영역**: Frontend
- **예상 소요**: 1시간
- **의존성**: FE-01
- **완료 조건 (체크박스)**:
  - [ ] `src/features/{auth,todos,categories,users}/` 하위 `components/hooks/api/types/`
  - [ ] `src/shared/{components,hooks,utils,types}/`
  - [ ] `src/lib/`, `src/pages/`, `src/routes/`
  - [ ] `src/shared/types/index.ts`에 `ApiError` 정의
  - [ ] 각 feature 도메인 타입 파일 초기 생성
- **산출물**: 디렉토리 트리, `*.types.ts`
- **참고**: 구조 원칙 8.1~8.3

---

### Task FE-03: axios 클라이언트 + 인터셉터

- **목표**: 토큰 자동 부착 + 401 자동 로그아웃.
- **담당 영역**: Frontend
- **예상 소요**: 1.5시간
- **의존성**: FE-01, FE-02
- **완료 조건 (체크박스)**:
  - [ ] `lib/api-client.ts`에 axios 인스턴스, `baseURL = VITE_API_BASE_URL`
  - [ ] Request 인터셉터: `useAuthStore.getState().token` → `Authorization: Bearer`
  - [ ] Response 인터셉터: 401 → `clearToken()` + `/login` 리다이렉트
  - [ ] 에러 응답을 `ApiError`로 정규화
  - [ ] localStorage/sessionStorage/Cookie 토큰 접근 코드 없음
- **산출물**: `lib/api-client.ts`
- **참고**: PRD 7.2, SCN-13

---

### Task FE-04: Zustand `useAuthStore` + TanStack Query Provider

- **목표**: 인메모리 토큰 스토어 + Query Provider.
- **담당 영역**: Frontend
- **예상 소요**: 1시간
- **의존성**: FE-01, FE-02
- **완료 조건 (체크박스)**:
  - [ ] `useAuthStore` — `token`, `user`, `setToken/clearToken/isAuthenticated`
  - [ ] Zustand `persist` 미들웨어 미사용 (localStorage 등 영속화 금지)
  - [ ] `lib/query-client.ts`에 `QueryClient` 단일 인스턴스
  - [ ] `QueryClientProvider`로 앱 래핑
  - [ ] 새로고침 시 토큰 소멸 → 비로그인 전환 확인
- **산출물**: `features/auth/store/auth-store.ts`, `lib/query-client.ts`, `main.tsx`
- **참고**: PRD FR-02/FR-03, SCN-13

---

### Task FE-05: React Router + Protected Route

- **목표**: 라우팅 + 인증 가드.
- **담당 영역**: Frontend
- **예상 소요**: 1시간
- **의존성**: FE-04
- **완료 조건 (체크박스)**:
  - [ ] 라우터 정의 (login, register, todos, categories, mypage)
  - [ ] `ProtectedRoute` — 비로그인 시 `/login`으로 `<Navigate>`
  - [ ] 비로그인 상태 `/todos` 접근 → `/login` 리다이렉트
  - [ ] 로그인 상태 `/login` 접근 → `/todos` 리다이렉트
- **산출물**: `routes/index.tsx`, `routes/ProtectedRoute.tsx`
- **참고**: PRD FR-06, 9.2

---

### Task FE-06: zod 스키마 + 공통 유틸

- **목표**: 폼 검증 zod 스키마 + 날짜 유틸.
- **담당 영역**: Frontend
- **예상 소요**: 1시간
- **의존성**: FE-02
- **완료 조건 (체크박스)**:
  - [ ] 회원가입/로그인/할일/카테고리 스키마 작성
  - [ ] 날짜 범위 `from <= to` `.refine()` 검증
  - [ ] `shared/utils/date.ts` (YYYY-MM-DD 포맷)
- **산출물**: 각 feature의 `*.schemas.ts`, `shared/utils/date.ts`
- **참고**: SCN-04, SCN-02

---

### Task FE-07: SCR-01 로그인 / SCR-02 회원가입

- **목표**: 로그인/회원가입 화면.
- **담당 영역**: Frontend
- **예상 소요**: 2.5시간
- **의존성**: FE-03~06, BE-07 완료 필요
- **완료 조건 (체크박스)**:
  - [ ] SCR-01: 이메일·비밀번호 폼, 로그인 버튼, 회원가입 링크
  - [ ] 로그인 성공 시 `setToken()` 후 `/todos`
  - [ ] 로그인 실패(401) 시 친화적 문구
  - [ ] SCR-02: 이름·이메일·비밀번호 + zod 실시간 검증
  - [ ] 회원가입 성공 시 `/login` + 안내
  - [ ] 중복 이메일(409) 인라인 오류
  - [ ] 비밀번호 show/hide 토글
- **산출물**: `pages/LoginPage.tsx`, `pages/RegisterPage.tsx`, `features/auth/**`
- **참고**: FR-01, FR-02, SCR-01/02, SCN-01/11/12

---

### Task FE-08: SCR-03 할일 목록 + 복합 필터

- **목표**: 할일 카드 목록 + 3개 필터 즉시 갱신.
- **담당 영역**: Frontend
- **예상 소요**: 3시간
- **의존성**: FE-03~05, BE-10/11/09 완료 필요
- **완료 조건 (체크박스)**:
  - [ ] 기본 정렬 카드 목록 렌더링
  - [ ] 필터 바 — 카테고리/날짜 from-to/완료 여부
  - [ ] 필터 변경 시 queryKey 변경으로 즉시 재호출
  - [ ] `due_date_from > due_date_to` 시 클라이언트 차단
  - [ ] 빈 결과 시 빈 상태 UI
  - [ ] 필터 초기화 버튼
  - [ ] 본인 할일만 표시 (BR-U3)
  - [ ] 네비게이션 (카테고리/마이페이지/로그아웃)
- **산출물**: `pages/TodoListPage.tsx`, `features/todos/**`
- **참고**: FR-08/09, SCR-03, SCN-04

---

### Task FE-09: SCR-04 등록/수정 모달 + 완료 토글 + 삭제

- **목표**: 할일 모달 + 완료 토글 + 삭제 확인.
- **담당 영역**: Frontend
- **예상 소요**: 3시간
- **의존성**: FE-08, BE-10
- **완료 조건 (체크박스)**:
  - [ ] 모달 — 제목/설명/마감일/카테고리 + zod
  - [ ] 등록 모드(빈 폼) / 수정 모드(프리필)
  - [ ] 저장 성공 시 `invalidateQueries`로 목록 갱신
  - [ ] 완료 토글 한 번 클릭 (BR-T3)
  - [ ] 완료 시 취소선 스타일
  - [ ] 삭제 → 확인 다이얼로그 → DELETE → 목록 제거
  - [ ] 네트워크 오류 시 토글 UI 롤백
- **산출물**: `features/todos/components/TodoModal.tsx`, hooks, `shared/components/ConfirmDialog.tsx`
- **참고**: FR-07/11/12/13, SCN-02/05/06/07

---

### Task FE-10: SCR-05 카테고리 관리

- **목표**: 카테고리 CRUD 화면.
- **담당 영역**: Frontend
- **예상 소요**: 2시간
- **의존성**: FE-05, FE-08, BE-09
- **완료 조건 (체크박스)**:
  - [ ] 기본 카테고리 수정/삭제 비활성화 (BR-C1)
  - [ ] "기본 카테고리는 변경할 수 없습니다" 툴팁
  - [ ] 사용자 카테고리 수정/삭제 활성
  - [ ] 추가 입력 + "추가" 버튼, 빈 이름 차단
  - [ ] 중복 이름(409) "이미 사용 중" 오류
  - [ ] 삭제 시 연결 할일 있으면(409) 오류 (BR-C4)
  - [ ] CRUD 성공 시 목록 즉시 갱신
- **산출물**: `pages/CategoriesPage.tsx`, `features/categories/**`
- **참고**: FR-14~17, SCR-05, SCN-03/08/15

---

### Task FE-11: SCR-06 마이페이지 (개인정보 + 회원 탈퇴)

- **목표**: 개인정보 수정 + 2단계 확인 회원 탈퇴.
- **담당 영역**: Frontend
- **예상 소요**: 2시간
- **의존성**: FE-05, FE-06, BE-08
- **완료 조건 (체크박스)**:
  - [ ] `GET /api/users/me`로 현재 정보 로드
  - [ ] 이름 수정 + 비밀번호 변경(현재 PW → 새 PW → 확인) 폼
  - [ ] 비밀번호 show/hide 토글
  - [ ] 새 PW 불일치 시 클라이언트 오류
  - [ ] 현재 PW 불일치(401) 시 오류
  - [ ] 수정 성공 시 토스트
  - [ ] 회원 탈퇴 → 2단계 확인 다이얼로그 (OI-04)
  - [ ] 탈퇴 확인 시 DELETE → `clearToken()` → `/login` + 안내
- **산출물**: `pages/MyPage.tsx`, `features/users/**`
- **참고**: FR-04/05, SCR-06, SCN-09/10

---

### Task FE-12: 반응형 UI 검증 + 에러 메시지 표준화

- **목표**: 3개 Breakpoint 검증 + 사용자 친화 에러 문구 통일.
- **담당 영역**: Frontend
- **예상 소요**: 2시간
- **의존성**: FE-07~11
- **완료 조건 (체크박스)**:
  - [ ] Mobile(<768px): 1열 세로, FAB(+), 가로 스크롤 없음
  - [ ] Tablet(768~1023) / Desktop(≥1024): 비율·여백 조정
  - [ ] 터치 타깃 ≥ 44×44px (SCN-14)
  - [ ] 모달이 모바일 키보드에 가려지지 않음
  - [ ] HTTP 상태 코드 화면 노출 금지
  - [ ] API 에러 → 친화 문구 매핑을 `shared/utils/error-message.ts`에 일괄 관리
  - [ ] 네트워크 단절 시 공통 메시지
  - [ ] 색상값 CSS 변수화 (2차 다크모드 대비)
- **산출물**: 각 페이지 반응형 스타일, `shared/utils/error-message.ts`
- **참고**: PRD 9.1/9.3, SCN-11/12/14/15, 구조 원칙 12장

---

### 프론트엔드 영역 요약 표

| Task ID | 제목 | 소요 | 의존성 | Day |
|---|---|---|---|---|
| FE-01 | 프로젝트 초기화 | 1.5h | 없음 | Day 1 |
| FE-02 | 디렉토리 / 공통 타입 | 1h | FE-01 | Day 1 |
| FE-03 | axios + 인터셉터 | 1.5h | FE-01, FE-02 | Day 1 |
| FE-04 | useAuthStore + QueryClient | 1h | FE-01, FE-02 | Day 1 |
| FE-05 | Router + Protected Route | 1h | FE-04 | Day 1 |
| FE-06 | zod 스키마 + 유틸 | 1h | FE-02 | Day 1 |
| FE-07 | SCR-01 로그인 / SCR-02 회원가입 | 2.5h | FE-03~06, BE-07 | Day 1 |
| FE-08 | SCR-03 할일 목록 + 필터 | 3h | FE-03~05, BE-09~11 | Day 2 |
| FE-09 | SCR-04 모달 + 토글 + 삭제 | 3h | FE-08, BE-10 | Day 2 |
| FE-10 | SCR-05 카테고리 관리 | 2h | FE-05, FE-08, BE-09 | Day 2 |
| FE-11 | SCR-06 마이페이지 | 2h | FE-05, FE-06, BE-08 | Day 3 |
| FE-12 | 반응형 + 에러 표준화 | 2h | FE-07~11 | Day 3 |

**총 예상 소요**: 약 **21.5시간**

---

## 7. 영역 간 의존성 매트릭스

| FE Task | 요구 BE Task | 요구 DB Task |
|---|---|---|
| FE-07 (로그인/회원가입) | BE-07 | DB-02, DB-06 |
| FE-08 (할일 목록 + 필터) | BE-09, BE-10, BE-11 | DB-02, DB-05 |
| FE-09 (모달/토글/삭제) | BE-10 | DB-02 |
| FE-10 (카테고리 관리) | BE-09 | DB-02, DB-03 |
| FE-11 (마이페이지/탈퇴) | BE-08 | DB-02, DB-04 |

### 병렬화 가이드
- **Day 1**: DB-01 → DB-02/03/04/05/06 + BE-01~07 + FE-01~07 가 **상당 부분 병렬** 가능
- **Day 2**: BE-08~11과 FE-08~10이 각 BE Task 완료 후 즉시 FE 진행 (수직적 파이프라인)
- **Day 3**: BE-12/14, FE-11/12 병렬

---

## 8. 리스크와 절충안

### 8.1 일정 위기 시 후순위 이동 권장

| 후순위 권장 Task | 이유 |
|---|---|
| BE-12 (Service 단위 테스트) | Must 기능 검증을 수동 QA로 대체 가능 |
| BE-14 (부하 테스트) | 출시 후 별도 검증 가능 |
| DB-07 (마이그레이션 분리) | schema.sql 단일 파일로도 운영 가능 |
| FE-10 일부 (FR-16 카테고리 수정) | 삭제 후 재생성으로 대체 |
| FE-11 일부 (비밀번호 변경) | 출시 후 보강 가능 |

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

| 버전 | 날짜 | 작성자 | 변경 내용 |
|---|---|---|---|
| 1.0 | 2026-05-13 | Execution Planner | 초안 — DB 7개 / BE 14개 / FE 12개 Task 분해, Day-by-Day 일정, 의존성 매트릭스 작성 |

---

*본 문서는 docs/ 디렉토리의 모든 상위 문서(도메인 정의서 v0.2, PRD v1.2, 사용자 시나리오 v1.1, 구조 원칙 v1.1, 아키텍처 v1.2, ERD v1.0, UC)를 기반으로 작성되었으며, 상위 문서 변경 시 본 실행계획도 함께 업데이트되어야 한다.*
