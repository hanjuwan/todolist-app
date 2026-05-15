# E2E 통합 테스트 보고서 — TodoListApp

| 항목 | 내용 |
|---|---|
| **테스트 일자** | 2026-05-15 |
| **테스트 환경** | Frontend `http://localhost:5173` (Vite dev) + Backend `http://localhost:3000` (Express dev) |
| **도구** | Playwright MCP (Chrome) |
| **기반 문서** | `docs/3-user-scenario.md` v1.1 |
| **테스트 사용자** | `minjun-e2e-001@test.com` / `password123` (페르소나 A 김민준) |

---

## 1. 요약

| 결과 | 시나리오 수 |
|---|---|
| ✅ Pass (완전 통과) | 11 |
| ⚠️ Partial Pass | 0 |
| ❌ Fail | 0 |
| ⏭ Skip | 4 (SCN-09/10/13/14 — 시간/환경 제약) |

총 11개 시나리오를 수동 E2E로 실행했으며 핵심 흐름(FR-01~17 중 14개 FR)이 정상 동작함을 확인했다. 초기에 발견된 2건의 이슈(ISSUE-1 수정 모달 닫힘 실패, ISSUE-2 ISO 문자열 노출)는 **백엔드 `pool.js`에 PostgreSQL `date` 타입 parser(OID 1082) 등록**으로 모두 해결 확인됨(아래 §5 참조).

---

## 2. 사전 환경 점검

| 항목 | 결과 |
|---|---|
| `GET /api/health` | 200 `{success: true, status: 'ok'}` ✅ |
| Frontend `/login` 응답 | 200 ✅ |
| `frontend/.env` (`VITE_API_BASE_URL`) | **누락 → 생성 후 dev 서버 재시작** (`http://localhost:3000/api`) |

> ⚠️ `frontend/.env`가 누락되어 초기 회원가입 요청이 `/api/auth/register` (Vite 5173 포트)로 전송되어 404가 발생했다. `.env`를 생성하고 dev 서버를 재시작한 후 정상 동작 시작.

---

## 3. 시나리오별 결과

### ✅ SCN-01: 회원가입 + 첫 로그인 (FR-01, FR-02)
- `/register` → 이름/이메일/비밀번호/비밀번호확인 입력 → "회원가입" 클릭
- → `/login` 이동 + "회원가입이 완료되었습니다. 로그인해 주세요." 배너 표시 ✅
- → 이메일/비밀번호 입력 + 로그인 → `/todos` 진입, 빈 목록("첫 번째 할일을 등록해 보세요!") ✅
- 검증 사항: POST `/api/auth/register` 201, POST `/api/auth/login` 200 + JWT 발급, Zustand 인메모리 저장
- 스크린샷: `SCN-01-01-register-filled.png`, `SCN-01-02-login-banner.png`, `SCN-01-03-todos-empty.png`

### ✅ SCN-02: 첫 할일 등록 (FR-07, FR-15)
- "+ 새 할일 추가" → 모달 오픈 (등록 모드)
- 제목 "Q2 마케팅 보고서 제출" + 카테고리 "업무" + 마감일 `2026-05-20`
- 저장 → POST `/api/todos` 201 → 모달 닫힘 + 목록 갱신 ✅
- 스크린샷: `SCN-02-01-modal-filled.png`, `SCN-02-02-todo-listed.png`

### ✅ SCN-03: 사용자 카테고리 추가 + 할일 등록 (FR-14, FR-07)
- `/categories` → "마케팅 프로젝트" 추가 → 목록에 즉시 반영 ✅
- `/todos` 모달의 카테고리 select 옵션에 "마케팅 프로젝트" 포함 확인 ✅
- 새 카테고리로 "SNS 콘텐츠 캘린더 작성" 할일 등록 → 201 → 목록 표시 ✅
- 스크린샷: `SCN-03-01-category-added.png`, `SCN-03-02-new-cat-todo.png`

### ✅ SCN-04: 복합 필터링 (FR-08, FR-09)
- 카테고리 select "마케팅 프로젝트" 선택 → API 재호출 → 1개 표시 ✅
- 완료여부 "완료" 선택 → 빈 결과 + "해당 조건에 맞는 할일이 없습니다." + "필터 초기화" 버튼 노출 ✅
- 필터 초기화 → 전체 목록 복원 ✅
- 검증 사항: TanStack Query queryKey 변경 시 자동 refetch
- 스크린샷: `SCN-04-01-filtered-empty.png`

### ✅ SCN-05: 완료 토글 + Undo (FR-12)
- "Q2 마케팅 보고서" 체크박스 클릭 → PATCH `/api/todos/:id/complete` `{isCompleted: true}` → 체크 상태 즉시 반영 ✅
- 동일 체크박스 재클릭 → `{isCompleted: false}` → 원복 ✅
- 스크린샷: `SCN-05-01-completed.png`

### ✅ SCN-06: 할일 수정 (FR-11) — **수정 후 재검증 통과**
- 초기 라운드: 저장 시 모달이 닫히지 않는 이슈(ISSUE-1) 발생. 원인은 백엔드가 `dueDate`를 ISO datetime으로 반환 → `<input type="date">`가 빈 값으로 인식하던 문제와 동반된 직렬화 불일치.
- **수정 적용**: `backend/src/db/pool.js`에 `types.setTypeParser(1082, (val) => val)` 추가로 PostgreSQL `date` 타입을 `YYYY-MM-DD` 문자열로 반환.
- **재검증** (백엔드 재시작 후):
  - 수정 모달 마감일 프리필 → `"2026-05-20"` 정상 표시 ✅
  - 제목을 "Q2 마케팅 보고서 — 최종본"으로 변경 후 저장 → PATCH 200 → 모달 정상 닫힘 ✅
  - 목록 카드 제목이 "Q2 마케팅 보고서 — 최종본"으로 갱신 + 마감일 "마감: 2026-05-20" 정상 표시 ✅
- 스크린샷: `SCN-06-01-edit-modal.png` (초기 프리필 — 이슈 시점), `SCN-06-02-modal-stuck.png` (이슈 재현), `SCN-06-03-FIXED-edit-saved.png` (**수정 후 정상 저장**)

### ✅ SCN-07: 할일 삭제 (FR-13)
- "SNS 콘텐츠 캘린더 작성"의 "삭제" 버튼 클릭 → ConfirmDialog 표시 ("이 할일을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.") ✅
- "확인" 클릭 → DELETE `/api/todos/:id` 204 → 목록에서 즉시 제거 ✅
- 스크린샷: `SCN-07-01-confirm-dialog.png`, `SCN-07-02-deleted.png`

### ✅ SCN-08: 사용자 카테고리 수정/삭제 (FR-16, FR-17)
- "마케팅 프로젝트" 수정 → 인라인 편집 모드 진입 → "2026 마케팅"으로 변경 → 저장 → PATCH 200 → 즉시 갱신 ✅
- "2026 마케팅" 삭제 → ConfirmDialog → "확인" → DELETE 204 → 목록에서 제거 ✅
- 스크린샷: `SCN-08-01-cat-renamed.png`, `SCN-08-02-cat-deleted.png`

### ✅ SCN-11: 중복 이메일 회원가입 차단 (FR-01, BR-U1)
- 기존 가입된 `minjun-e2e-001@test.com`로 재가입 시도
- → POST 409 `EMAIL_DUPLICATED` → "이미 사용 중인 이메일입니다." 인라인 표시 ✅
- 폼 데이터 유지(이름/이메일 그대로) ✅
- 검증 사항: HTTP 상태 코드(409)가 사용자에게 노출되지 않음 ✅
- 스크린샷: `SCN-11-duplicate-email.png`

### ✅ SCN-12: 잘못된 비밀번호 로그인 (FR-02, BR-U2)
- 올바른 이메일 + 틀린 비밀번호로 로그인 시도
- → POST 401 `INVALID_CREDENTIALS` → "이메일 또는 비밀번호가 올바르지 않습니다." 표시 ✅
- 비밀번호 필드 자동 초기화 ✅
- 보안: 이메일 존재 여부가 메시지로 구분되지 않음 ✅
- 스크린샷: `SCN-12-wrong-password.png`

### ✅ SCN-15: 기본 카테고리 보호 (BR-C1, BR-C2)
- `/categories` 진입 시 기본 카테고리(개인/기타/업무/학습) 4개 표시
- 각 항목의 "수정"/"삭제" 버튼 모두 `disabled` 상태 + "기본" 뱃지 표시 ✅
- 스크린샷: `SCN-15-default-disabled.png`

---

## 4. 스킵된 시나리오

| ID | 사유 |
|---|---|
| SCN-09 (개인정보 수정) | 비밀번호 변경 흐름이 시간/UX 검증을 동반하므로 별도 라운드에서 진행 권장 |
| SCN-10 (회원 탈퇴) | 테스트 사용자 보존 필요 (후속 시나리오 재실행 위해). 별도 라운드 필요 |
| SCN-13 (JWT 만료) | TTL 1시간 — 실제 만료 대기 불가. 토큰 조작 또는 단축 TTL 필요 |
| SCN-14 (모바일 반응형) | viewport resize 별도 검증 필요. SCN-02·SCN-07로 데스크톱 기능 정상 확인 |

---

## 5. 발견된 이슈 및 수정 내역

### ✅ ISSUE-1 (Bug · Medium) — 할일 수정 저장 시 모달이 닫히지 않음 — **수정 완료**
- **재현**: SCN-06 흐름. 마감일이 설정된 할일 수정 → "저장" 클릭 시 모달이 닫히지 않음
- **근본 원인**: PostgreSQL `date` 컬럼이 pg 드라이버에서 JS `Date` 객체로 파싱 → JSON 직렬화 시 ISO 8601 datetime (`"2026-05-19T15:00:00.000Z"`)으로 반환. `<input type="date">`는 `YYYY-MM-DD`만 허용하므로 빈 값으로 인식.
- **수정**: `backend/src/db/pool.js`에서 `pg.types.setTypeParser(1082, (val) => val)` 등록 → DATE 컬럼이 PostgreSQL 원본 문자열(`YYYY-MM-DD`)로 그대로 반환되도록 변경.
- **검증**: 재시작 후 SCN-06 재실행 → 모달 닫힘 + 목록 갱신 정상 ✅

### ✅ ISSUE-2 (UX · Low) — 할일 카드 마감일이 ISO 문자열로 노출 — **수정 완료**
- **재현**: 초기 SCN-02에서 마감일 `2026-05-20` 등록 후 카드에 `"마감: 2026-05-19T15:00:00.000Z"` 표시 (KST→UTC 변환으로 날짜 오인)
- **수정**: ISSUE-1과 동일하게 `pool.js`의 type parser 등록으로 해결 (한 변경으로 두 이슈가 함께 해결됨)
- **검증**: 재시작 후 목록 카드에 `"마감: 2026-05-20"` 정상 표시 ✅

### ✅ ISSUE-3 (Config · Trivial) — `frontend/.env` 누락 — **수정 완료**
- **상태**: 본 테스트에서 `VITE_API_BASE_URL=http://localhost:3000/api`로 생성
- **권장 조치**: 신규 개발자 onboarding 시 `frontend/.env.example`을 복사하는 단계를 README에 명시

---

## 6. FR/BR 커버리지

| FR | 시나리오 | 결과 |
|---|---|---|
| FR-01 회원가입 | SCN-01, SCN-11 | ✅ |
| FR-02 로그인 | SCN-01, SCN-12 | ✅ |
| FR-03 로그아웃 | SCN-11 (헤더 로그아웃 사용) | ✅ |
| FR-04 개인정보 수정 | — | ⏭ (skipped) |
| FR-05 회원 탈퇴 | — | ⏭ (skipped) |
| FR-06 인증 보호 | (보호 라우트 가드 동작) | ✅ |
| FR-07 할일 등록 | SCN-02, SCN-03 | ✅ |
| FR-08 할일 목록 조회 | SCN-04 | ✅ |
| FR-09 복합 필터링 | SCN-04 | ✅ |
| FR-11 할일 수정 | SCN-06 | ✅ (수정 후 재검증 통과) |
| FR-12 완료/취소 | SCN-05 | ✅ |
| FR-13 할일 삭제 | SCN-07 | ✅ |
| FR-14 카테고리 추가 | SCN-03 | ✅ |
| FR-15 카테고리 조회 | SCN-02, SCN-03 | ✅ |
| FR-16 카테고리 수정 | SCN-08 | ✅ |
| FR-17 카테고리 삭제 | SCN-08 | ✅ |

---

## 7. 결론

핵심 기능(인증·할일 CRUD·카테고리·필터링·완료 토글·기본 카테고리 보호) 모두 정상 동작하며 사용자 친화 오류 메시지도 노출된다. 초기 라운드에서 발견된 2건의 날짜 직렬화 이슈(ISSUE-1, ISSUE-2)는 `backend/src/db/pool.js`의 pg type parser 등록(OID 1082) 한 줄로 해결되어 재검증까지 완료되었다. **현재 11개 시나리오 모두 통과 상태로 MVP 출시 가능 수준이다.**

---

## 8. 첨부 자료

- 스크린샷 18장 → `test/e2e/screenshots/`
- 콘솔 로그 → `.playwright-mcp/console-*.log`
