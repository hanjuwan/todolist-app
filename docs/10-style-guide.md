# 프론트엔드 스타일 가이드 (Style Guide) — TodoListApp

| 항목 | 내용 |
|------|------|
| **버전** | 1.0 |
| **작성일** | 2026-05-14 |
| **시각 레퍼런스** | 첨부 이미지 ("팀캘린더톡" 캘린더 화면) |
| **적용 대상** | SCR-01 ~ SCR-06 (PRD §9, 와이어프레임 §8) |

본 가이드는 첨부된 레퍼런스 화면의 시각 톤·구성·인터랙션을 TodoListApp 프론트엔드에 적용하기 위한 디자인 토큰과 컴포넌트 규칙을 정의한다. **깔끔한 화이트 베이스 + 블루 Primary + 그린 Accent + 오렌지 Warning + 레드 Danger** 의 5색 시스템을 기본 골격으로 한다.

---

## 1. 디자인 원칙

| 원칙 | 설명 |
|------|------|
| **여백 우선 (Spacious)** | 카드·패널 사이를 충분히 띄워 시각적 호흡을 만든다. 좁히지 않는다. |
| **부드러운 모서리 (Rounded)** | 모든 인터랙티브 요소는 6~10px 반경. 카드는 12px. 알약형 뱃지는 999px. |
| **가벼운 경계 (Hairline borders)** | 1px `--color-border` 선으로만 분리. 회색 배경 박스는 지양. |
| **의미 있는 색 (Semantic color)** | 색은 의미(상태·액션)를 전달. 장식용 색 사용 금지. |
| **터치 친화 (44×44px)** | 모든 클릭 가능 요소는 최소 44×44px 타깃 확보 (SCN-14). |
| **상태 가시화 (State-visible)** | 진행·대기·성공·실패·완료 상태는 항상 색과 텍스트로 동시 표시. |

---

## 2. 컬러 토큰

`styles/global.css` 의 CSS 변수로 정의한다. 컴포넌트는 hex를 직접 쓰지 않는다.

### 2.1 Primary — Blue
파란색 계열은 **주요 액션 버튼**(저장, 추가, 로그인)과 **활성 네비게이션 강조 칩**에 사용.

| 토큰 | 값 (hex) | 용도 |
|------|---------|------|
| `--color-primary` | `#2563EB` | 주요 버튼 배경, 링크, 포커스 링 (레퍼런스 "+ 새 일정" 버튼) |
| `--color-primary-hover` | `#1D4ED8` | hover/active |
| `--color-primary-soft-bg` | `#DBEAFE` | 활성 칩/뱃지 배경 (레퍼런스 "MyApp 개발 팀1") |
| `--color-primary-soft-text` | `#1E40AF` | 활성 칩/뱃지 텍스트 |

### 2.2 Accent — Green
초록색은 **완료·온라인·승인 등 긍정 상태**와 **할일(Todo) 카테고리 카드 마커**에 사용. 레퍼런스의 캘린더 이벤트 색상과 동일.

| 토큰 | 값 | 용도 |
|------|---|------|
| `--color-accent` | `#16A34A` | 완료 토글 ON, 승인 버튼, 이벤트/카테고리 칩 배경 |
| `--color-accent-hover` | `#15803D` | hover |
| `--color-accent-soft-bg` | `#DCFCE7` | "오늘" 셀 배경(레퍼런스 05일자), 성공 토스트 배경 |
| `--color-accent-text-on` | `#FFFFFF` | accent 배경 위 텍스트 |

### 2.3 Warning — Orange
주황색은 **대기 중·요청·주의 환기**에 사용. 마감 임박 할일 강조에도 활용.

| 토큰 | 값 | 용도 |
|------|---|------|
| `--color-warning` | `#F97316` | 경고 아이콘, 마감 임박 표시 |
| `--color-warning-soft-bg` | `#FFEDD5` | 카드 배경 (레퍼런스 "일정 변경 요청" 카드) |
| `--color-warning-soft-border` | `#FDBA74` | 카드 외곽 1px |
| `--color-warning-text` | `#9A3412` | 뱃지 텍스트 (레퍼런스 "대기 중인 요청 1건") |

### 2.4 Danger — Red
빨간색은 **삭제·거절·오류**에만 사용. 일상 UI에서 빈도 최소화.

| 토큰 | 값 | 용도 |
|------|---|------|
| `--color-danger` | `#DC2626` | 삭제 버튼 텍스트/테두리 (레퍼런스 "× 거절"), 오류 메시지 |
| `--color-danger-hover` | `#B91C1C` | hover |
| `--color-danger-soft-bg` | `#FEE2E2` | 인라인 오류 배경 (사용 시) |

### 2.5 Neutral — Surface / Text
| 토큰 | 값 | 용도 |
|------|---|------|
| `--color-bg` | `#FFFFFF` | 페이지 배경 |
| `--color-surface` | `#F8FAFC` | 카드 hover, 컨테이너 약한 강조 |
| `--color-border` | `#E5E7EB` | 1px 경계 |
| `--color-border-strong` | `#CBD5E1` | input/select 경계 |
| `--color-text` | `#111827` | 본문 |
| `--color-text-muted` | `#6B7280` | 보조 텍스트, placeholder, 비활성 요일 |
| `--color-text-disabled` | `#9CA3AF` | 이전/다음 달 날짜 (레퍼런스 28,29,30,01) |
| `--color-focus-ring` | `rgba(37, 99, 235, 0.35)` | 키보드 포커스 |

---

## 3. 타이포그래피

### 3.1 폰트 패밀리
```css
font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont,
             system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
             'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
```

### 3.2 스케일

| 토큰 | size / line-height / weight | 용도 |
|------|------------------------------|------|
| `--text-display` | 22px / 32px / 700 | 페이지 헤더 로고 ("팀캘린더톡" 위치) |
| `--text-h1` | 20px / 28px / 700 | 페이지 제목 (예: "마이페이지") |
| `--text-h2` | 17px / 24px / 600 | 섹션 제목, 패널 헤더 ("팀 채팅") |
| `--text-body` | 14px / 20px / 400 | 본문 기본 |
| `--text-body-strong` | 14px / 20px / 600 | 강조 본문 (Todo 제목, "MyApp 개발 팀1") |
| `--text-small` | 12px / 16px / 400 | 메타 정보, 타임스탬프 |
| `--text-button` | 14px / 20px / 600 | 버튼 라벨 |

숫자(날짜 셀, 카운터)는 `font-variant-numeric: tabular-nums` 적용 → 정렬 안정성.

---

## 4. 간격 (Spacing) & 레이아웃

### 4.1 간격 토큰 (8pt grid)

| 토큰 | px | 용도 |
|------|----|------|
| `--space-1` | 4 | 아이콘·텍스트 미세 간격 |
| `--space-2` | 8 | 인라인 요소 |
| `--space-3` | 12 | 카드 내 행 간격 |
| `--space-4` | 16 | 컴포넌트 표준 패딩 |
| `--space-5` | 24 | 섹션 간격 |
| `--space-6` | 32 | 페이지 영역 분리 |
| `--space-8` | 48 | 페이지 상하 여백 |

### 4.2 반응형 브레이크포인트

| 이름 | 범위 | 컨테이너 max-width |
|------|------|---------------------|
| Mobile | `< 768px` | 100% (좌우 16px padding) |
| Tablet | `768~1023px` | 720px |
| Desktop | `≥ 1024px` | 960px (할일 페이지는 우측 패널 포함 시 1200px) |

### 4.3 모서리(Radius)

| 토큰 | 값 | 적용 |
|------|---|------|
| `--radius-sm` | 6px | input, select, 작은 버튼 |
| `--radius-md` | 8px | 표준 버튼, 다이얼로그 안쪽 요소 |
| `--radius-lg` | 12px | 카드, 모달, 패널 |
| `--radius-pill` | 999px | 뱃지, 칩 ("MyApp 개발 팀1") |

### 4.4 그림자(Elevation)

| 토큰 | 값 | 적용 |
|------|---|------|
| `--shadow-sm` | `0 1px 2px rgba(15, 23, 42, 0.04)` | 카드 정적 상태 |
| `--shadow-md` | `0 4px 12px rgba(15, 23, 42, 0.08)` | 카드 hover, 드롭다운 |
| `--shadow-lg` | `0 12px 32px rgba(15, 23, 42, 0.12)` | 모달, 다이얼로그 |

---

## 5. 컴포넌트 사양

### 5.1 Button

레퍼런스의 "+ 새 일정"(Primary), "✓ 승인"(Accent), "× 거절"(Danger Outline) 을 표준으로 삼는다.

| Variant | 배경 | 텍스트 | 테두리 | 사용 |
|---------|------|--------|--------|------|
| `primary` | `--color-primary` | white | none | 저장, 추가, 로그인, 회원가입 |
| `accent` | `--color-accent` | white | none | 승인, 완료 처리 토글(체크 상태) |
| `secondary` | white | `--color-text` | `--color-border-strong` 1px | 취소, 보조 액션 (레퍼런스 "로그아웃") |
| `danger-outline` | white | `--color-danger` | `--color-danger` 1px | 삭제 확인, 거절 |
| `ghost` | transparent | `--color-text` | none | 네비게이션 링크 |

공통 규칙:
- 높이 36/40/44px (sm/md/lg). 기본 md.
- 좌우 padding 14/16/20px.
- `border-radius: var(--radius-md)`.
- `font-weight: 600`, `letter-spacing: 0`.
- 포커스: `outline: 2px solid var(--color-focus-ring); outline-offset: 2px`.
- disabled: `opacity: 0.5; cursor: not-allowed`.
- 좌측 아이콘 + 라벨 간격 `--space-2` (8px).

### 5.2 Badge / Chip
레퍼런스의 "MyApp 개발 팀1"(파란 칩), "대기 중인 요청 1건"(주황 알약), "요청"(주황 미니), "온라인"(초록 도트) 패턴.

```css
.chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 10px; border-radius: var(--radius-pill);
  font: 600 12px/16px var(--font);
}
.chip--primary { background: var(--color-primary-soft-bg); color: var(--color-primary-soft-text); }
.chip--warning { background: var(--color-warning-soft-bg); color: var(--color-warning-text); border: 1px solid var(--color-warning-soft-border); }
.chip--accent  { background: var(--color-accent-soft-bg); color: var(--color-accent-hover); }
.chip--default { background: #F1F5F9; color: var(--color-text-muted); }
```

활용:
- **카테고리 표시 칩** — 사용자 카테고리는 `chip--primary`, 기본 카테고리는 `chip--default` + "기본" 보조 라벨.
- **마감 임박** (오늘 ≤ dueDate ≤ +2d) — `chip--warning`.
- **완료** — `chip--accent` 텍스트 "완료".
- **온라인/연결 상태** — 점(•) + 텍스트 형태.

### 5.3 Input / Select / Textarea
- 높이 40px (sm 36, lg 44).
- 좌우 padding 12px.
- 테두리 1px `--color-border-strong`, 포커스 시 2px `--color-primary` + 외곽 `--color-focus-ring`.
- placeholder 색 `--color-text-muted`.
- 오류 상태: 테두리 `--color-danger`, 하단 `--color-danger` 11px 메시지.
- 라벨은 input 위 8px 간격 + `--text-small` + `font-weight: 600`.

### 5.4 Card
레퍼런스의 "일정 변경 요청" 카드 = 의미적 색을 가진 카드 / 캘린더 셀 = 무색 카드.

```css
.card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
}
.card--warning { background: var(--color-warning-soft-bg); border-color: var(--color-warning-soft-border); }
.card:hover { box-shadow: var(--shadow-md); }
```

`TodoCard` 권장 구성:
1. 1행: 완료 체크박스(원형 토글) + 제목(`--text-body-strong`).
2. 2행: 카테고리 칩 + 마감일 칩 (`--text-small`).
3. 3행(hover/포커스 시): 수정/삭제 아이콘 버튼.

### 5.5 Header / Navigation
레퍼런스 상단 그대로 차용.

- 페이지 좌상단 **로고 텍스트** (`--text-display`, primary 색 또는 본문 색).
- 우측 네비게이션 링크 5~6개 (`ghost` 버튼). 활성 항목은 `chip--primary` 배경.
- 사용자 정보 칩(이름) + `secondary` "로그아웃" 버튼.
- 헤더 하단 1px `--color-border` 구분선.
- 높이 64px.

### 5.6 Side Panel (옵션)
레퍼런스 우측 "팀 채팅" 패널처럼 **보조 정보 패널**을 두는 경우:
- 폭 320~360px (Desktop만), Tablet 이하에서는 풀스크린 시트로 전환.
- 상단 헤더: 아이콘 + `--text-h2` 제목 + 우측 상태 표시.
- 본문은 카드 스택. 입력 영역은 sticky bottom.

### 5.7 Modal / Dialog
- 폭: 모바일 100% - 32px, 태블릿/데스크톱 480px(기본) / 560px(할일 모달).
- `--radius-lg` 12px, `--shadow-lg`.
- 헤더(타이틀) - 본문(폼) - 푸터(취소 + Primary) 3단.
- 배경 dim: `rgba(15, 23, 42, 0.4)`.
- Esc 키 / 배경 클릭으로 닫힘. 확인 다이얼로그(삭제, 탈퇴)는 배경 클릭 닫힘 비활성.

### 5.8 Toast
- 우상단 또는 하단 고정. 3초 자동 소멸. role="status".
- variant: success(accent), error(danger), info(primary).
- 좌측 아이콘 + 본문 + 닫기 버튼.

### 5.9 Empty State
- 아이콘(64px, 회색) + 1줄 안내 + (옵션) 액션 버튼.
- 필터 적용 시: "해당 조건에 맞는 할일이 없습니다." + "필터 초기화" `secondary` 버튼.
- 미적용 시: "첫 번째 할일을 등록해 보세요!" + "+ 할일 추가" `primary` 버튼.

---

## 6. 화면별 적용 가이드 (TodoListApp 매핑)

| 화면 | 핵심 컴포넌트 적용 |
|------|--------------------|
| **SCR-01 로그인** | 중앙 정렬 카드(360px), 로고(`--text-display`), 이메일/비밀번호 Input, Primary "로그인" 버튼, 하단 ghost "회원가입" 링크. |
| **SCR-02 회원가입** | 동일 카드 컨테이너, 4개 필드, Primary "가입하기". 인라인 오류는 `--color-danger`. |
| **SCR-03 할일 목록** | 헤더(네비) → FilterBar(카테고리 select + 완료 라디오 + 날짜 range) → TodoCard 목록. 모바일 FAB(56×56, primary 원형, 우하단 fixed). |
| **SCR-04 할일 모달** | Modal 560px, 제목/설명/마감일/카테고리 4필드, 푸터에 secondary "취소" + primary "저장". |
| **SCR-05 카테고리 관리** | 헤더 아래 "추가" 인풋 행 → CategoryRow 목록. 기본 카테고리는 `chip--default` + 수정/삭제 disabled + tooltip. |
| **SCR-06 마이페이지** | 2개 섹션 카드: 개인정보(이름/비번 변경) + 탈퇴. 탈퇴 카드는 `card--warning`. |

---

## 7. 인터랙션 & 모션

- **트랜지션 기본값**: `transition: all 150ms ease-out`.
- **호버 강조**: 카드는 `box-shadow` sm→md, 버튼은 배경 색 한 단계 다크.
- **포커스 가시성**: 키보드 포커스는 항상 `--color-focus-ring` 2px 외곽 + 컴포넌트 본 테두리 색 변경.
- **낙관적 업데이트 롤백**: 토글·삭제 실패 시 200ms 페이드로 원상 복귀 + toast(error).
- **로딩**: 목록 빈 동안 스켈레톤 카드 3개 (높이 72px, `--color-surface` shimmer). 모달 제출 중 버튼 라벨을 "저장 중…"으로 교체, disabled.

---

## 8. 접근성 (A11y) 체크리스트

- [ ] 모든 상호작용 요소 키보드 도달 가능 (Tab, Shift+Tab, Enter, Space, Esc).
- [ ] 색만으로 의미를 전달하지 않는다 (예: 완료는 색 + "완료" 라벨 + 취소선).
- [ ] 대비 비율 텍스트 4.5:1, 큰 텍스트/아이콘 3:1 이상.
- [ ] 폼 라벨은 `<label for>` 또는 `aria-label` 명시.
- [ ] 모달/다이얼로그 `role="dialog"`, `aria-modal="true"`, 포커스 트랩.
- [ ] 토스트 `role="status"` (성공) / `role="alert"` (오류).
- [ ] 터치 타깃 최소 44×44px.

---

## 9. 적용 우선순위

신규 프론트엔드 구현 시 토큰 → 컴포넌트 → 화면 순으로 도입한다.

1. `styles/global.css` 에 §2·§3·§4 토큰 일괄 정의.
2. `shared/components/{Button, Chip, Input, Card, Modal, Toast, EmptyState}.tsx` 표준 컴포넌트 작성.
3. 화면별 컴포넌트에서 토큰·표준 컴포넌트만 사용.
4. 하드코딩된 hex/px는 lint 또는 코드 리뷰로 차단.
