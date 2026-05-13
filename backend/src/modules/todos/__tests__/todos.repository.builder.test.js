'use strict';

// vitest globals (config: globals: true). vi.mock는 호이스팅됨.

// pool은 사용하지 않지만 require side-effect 회피를 위해 mock
vi.mock('../../../db/pool', () => ({ pool: { query: vi.fn() } }));

const { buildFilterClauses } = require('../todos.repository');

describe('todos.repository.buildFilterClauses (BE-11 — SQL Injection 방지: $N 파라미터)', () => {
  it('user_id만 — WHERE user_id = $1', () => {
    const { where, params } = buildFilterClauses('u1', {});
    expect(where).toBe('user_id = $1');
    expect(params).toEqual(['u1']);
  });

  it('user_id + categoryId + isCompleted', () => {
    const { where, params } = buildFilterClauses('u1', { categoryId: 'c', isCompleted: true });
    expect(where).toBe('user_id = $1 AND category_id = $2 AND is_completed = $3');
    expect(params).toEqual(['u1', 'c', true]);
  });

  it('user_id + dueDate range', () => {
    const { where, params } = buildFilterClauses('u1', {
      dueDateFrom: '2026-05-01',
      dueDateTo: '2026-05-31',
    });
    expect(where).toBe('user_id = $1 AND due_date >= $2 AND due_date <= $3');
    expect(params).toEqual(['u1', '2026-05-01', '2026-05-31']);
  });

  it('user_id + keyword (ILIKE 양쪽이 동일 $N 재사용)', () => {
    const { where, params } = buildFilterClauses('u1', { keyword: '러닝' });
    expect(where).toBe('user_id = $1 AND (title ILIKE $2 OR description ILIKE $2)');
    expect(params).toEqual(['u1', '%러닝%']);
  });

  it('모든 필터 조합 — 인덱스 순차 누적', () => {
    const { where, params } = buildFilterClauses('u1', {
      categoryId: 'c1',
      isCompleted: false,
      dueDateFrom: '2026-05-01',
      dueDateTo: '2026-05-31',
      keyword: 'kw',
    });
    expect(where).toBe(
      'user_id = $1 AND category_id = $2 AND is_completed = $3 AND due_date >= $4 AND due_date <= $5 AND (title ILIKE $6 OR description ILIKE $6)',
    );
    expect(params).toEqual(['u1', 'c1', false, '2026-05-01', '2026-05-31', '%kw%']);
  });
});
