'use strict';

const { pool } = require('../../db/pool');

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    dueDate: row.due_date,
    isCompleted: row.is_completed,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SELECT_COLS =
  'id, user_id, category_id, title, description, start_date, due_date, is_completed, completed_at, created_at, updated_at';

/**
 * BE-11: 동적 필터 빌더. WHERE user_id = $1 고정 + 옵션 조건 누적.
 * 문자열 결합으로 SQL을 만들지 않는다 — 값은 항상 $N 파라미터.
 */
function buildFilterClauses(userId, filters) {
  const where = ['user_id = $1'];
  const params = [userId];
  let i = 2;

  if (filters.categoryId) {
    where.push(`category_id = $${i++}`);
    params.push(filters.categoryId);
  }
  if (filters.isCompleted !== undefined) {
    where.push(`is_completed = $${i++}`);
    params.push(filters.isCompleted);
  }
  if (filters.dueDateFrom) {
    where.push(`due_date >= $${i++}`);
    params.push(filters.dueDateFrom);
  }
  if (filters.dueDateTo) {
    where.push(`due_date <= $${i++}`);
    params.push(filters.dueDateTo);
  }
  if (filters.keyword) {
    where.push(`(title ILIKE $${i} OR description ILIKE $${i})`);
    params.push(`%${filters.keyword}%`);
    i++;
  }

  return { where: where.join(' AND '), params, nextIndex: i };
}

async function listForUser(userId, filters) {
  const { where, params, nextIndex } = buildFilterClauses(userId, filters);
  const limit = filters.limit ?? 20;
  const page = filters.page ?? 1;
  const offset = (page - 1) * limit;

  const dataSql =
    `SELECT ${SELECT_COLS} FROM todos WHERE ${where} ` +
    `ORDER BY created_at DESC LIMIT $${nextIndex} OFFSET $${nextIndex + 1}`;
  const countSql = `SELECT count(*)::int AS cnt FROM todos WHERE ${where}`;

  const [{ rows: data }, { rows: countRows }] = await Promise.all([
    pool.query(dataSql, [...params, limit, offset]),
    pool.query(countSql, params),
  ]);

  return {
    items: data.map(mapRow),
    pagination: {
      page,
      limit,
      total: countRows[0].cnt,
      totalPages: Math.max(1, Math.ceil(countRows[0].cnt / limit)),
    },
  };
}

async function findByIdForUser(id, userId) {
  const { rows } = await pool.query(
    `SELECT ${SELECT_COLS} FROM todos WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return mapRow(rows[0]);
}

async function create({ userId, categoryId, title, description, startDate, dueDate }) {
  const { rows } = await pool.query(
    `INSERT INTO todos (user_id, category_id, title, description, start_date, due_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${SELECT_COLS}`,
    [userId, categoryId, title, description ?? null, startDate ?? null, dueDate ?? null],
  );
  return mapRow(rows[0]);
}

async function updateForUser({ id, userId, fields }) {
  const sets = [];
  const params = [];
  let i = 1;

  for (const [col, val] of Object.entries(fields)) {
    sets.push(`${col} = $${i++}`);
    params.push(val);
  }
  if (sets.length === 0) return findByIdForUser(id, userId);

  sets.push(`updated_at = now()`);
  params.push(id, userId);

  const { rows } = await pool.query(
    `UPDATE todos SET ${sets.join(', ')}
      WHERE id = $${i++} AND user_id = $${i}
      RETURNING ${SELECT_COLS}`,
    params,
  );
  return mapRow(rows[0]);
}

async function toggleComplete({ id, userId, isCompleted }) {
  const { rows } = await pool.query(
    `UPDATE todos
        SET is_completed = $1,
            completed_at = CASE WHEN $1 THEN now() ELSE NULL END,
            updated_at = now()
      WHERE id = $2 AND user_id = $3
      RETURNING ${SELECT_COLS}`,
    [isCompleted, id, userId],
  );
  return mapRow(rows[0]);
}

async function deleteForUser({ id, userId }) {
  const { rows } = await pool.query(
    'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId],
  );
  return rows.length > 0;
}

module.exports = {
  buildFilterClauses, // 테스트용 export
  listForUser,
  findByIdForUser,
  create,
  updateForUser,
  toggleComplete,
  deleteForUser,
};
