// k6 부하 테스트 — 300 VU × 1분 (PRD 3.2 / 7.1 P95 < 500ms 검증)
// 실행: k6 run -e BASE_URL=http://localhost:3001 backend/load-test/k6-todos.js
//
// 시나리오: register → login → POST /todos → GET /todos
// 가입은 setup() 단계에서 1회. 각 VU는 같은 사용자로 로그인하여 부하 발생.

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export const options = {
  stages: [
    { duration: '20s', target: 100 },
    { duration: '40s', target: 300 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // 에러율 < 1%
    http_req_duration: ['p(95)<500'], // P95 < 500ms (PRD 7.1)
  },
};

export function setup() {
  const email = `loadtest_${Date.now()}@example.com`;
  const password = 'loadtest123';
  http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({ email, password, name: 'LoadTest' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  const login = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  const accessToken = login.json('data.accessToken');
  const categories = http
    .get(`${BASE_URL}/api/categories`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .json('data');
  const defaultCategoryId = categories.find((c) => c.isDefault).id;
  return { accessToken, defaultCategoryId, email, password };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.accessToken}`,
  };

  const create = http.post(
    `${BASE_URL}/api/todos`,
    JSON.stringify({
      categoryId: data.defaultCategoryId,
      title: `load_${__VU}_${__ITER}`,
      dueDate: '2026-06-30',
    }),
    { headers },
  );
  check(create, { 'POST /todos 201': (r) => r.status === 201 });

  const list = http.get(`${BASE_URL}/api/todos?limit=20`, { headers });
  check(list, { 'GET /todos 200': (r) => r.status === 200 });

  sleep(0.1);
}

export function teardown(data) {
  http.del(`${BASE_URL}/api/users/me`, JSON.stringify({ currentPassword: data.password }), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.accessToken}`,
    },
  });
}
