# Load Test

## 사전 준비

- k6 설치: <https://k6.io/docs/get-started/installation/>
- 백엔드 서버 기동: `cd backend && node src/server.js`
- DB는 깨끗한 상태 권장 (시드 데이터 4건 + 추가 데이터 없음)

## 실행

```powershell
k6 run -e BASE_URL=http://localhost:3001 backend/load-test/k6-todos.js
```

## 시나리오

- 단계: 20초 동안 100 VU 램프업 → 40초간 300 VU 유지 → 20초 ramp-down (총 1분 20초)
- 각 VU 반복: POST /api/todos → GET /api/todos?limit=20 → sleep 100ms
- 인증: setup()에서 1회 가입·로그인, accessToken 공유 (단일 사용자 300명 동시 접속을 모사)

## 임계값

- `http_req_failed < 1%`
- `http_req_duration p(95) < 500ms` (PRD 7.1 KPI)

## 검증 포인트

- pg.Pool `max: 20` 대기열 정상 (커넥션 고갈로 인한 에러 없음)
- 응답 본문 표준 스키마 유지 (성공 `{ success: true, data, pagination? }`)
- 부하 후 종료 시 graceful shutdown (`SIGINT` → `pool.end()`)

## 결과 기록 권장 항목

| 항목 | 측정값 |
| --- | --- |
| 평균 응답 시간 | |
| P95 응답 시간 | |
| P99 응답 시간 | |
| 에러율 | |
| RPS | |
| pg 활성 커넥션 피크 | |
