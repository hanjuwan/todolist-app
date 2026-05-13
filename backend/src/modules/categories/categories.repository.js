'use strict';

const { pool } = require('../../db/pool');

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    isDefault: row.is_default,
    createdAt: row.created_at,
  };
}

// 본인 정의 + 기본 카테고리(user_id IS NULL)를 함께 반환
async function listForUser(userId) {
  const { rows } = await pool.query(
    `SELECT id, user_id, name, is_default, created_at
       FROM categories
      WHERE user_id = $1 OR user_id IS NULL
      ORDER BY is_default DESC, name ASC`,
    [userId],
  );
  return rows.map(mapRow);
}

// id 기반 단건 조회. is_default 또는 본인 소유만 노출.
async function findByIdForUser(id, userId) {
  const { rows } = await pool.query(
    `SELECT id, user_id, name, is_default, created_at
       FROM categories
      WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)`,
    [id, userId],
  );
  return mapRow(rows[0]);
}

// 동일 사용자 내 동일 이름 존재 여부
async function findByUserAndName(userId, name) {
  const { rows } = await pool.query(
    'SELECT id FROM categories WHERE user_id = $1 AND name = $2',
    [userId, name],
  );
  return rows[0] || null;
}

async function create({ userId, name }) {
  const { rows } = await pool.query(
    `INSERT INTO categories (user_id, name, is_default)
     VALUES ($1, $2, false)
     RETURNING id, user_id, name, is_default, created_at`,
    [userId, name],
  );
  return mapRow(rows[0]);
}

async function updateForUser({ id, userId, name }) {
  const { rows } = await pool.query(
    `UPDATE categories
        SET name = $1
      WHERE id = $2 AND user_id = $3 AND is_default = false
      RETURNING id, user_id, name, is_default, created_at`,
    [name, id, userId],
  );
  return mapRow(rows[0]);
}

async function deleteForUser({ id, userId }) {
  const { rows } = await pool.query(
    `DELETE FROM categories
      WHERE id = $1 AND user_id = $2 AND is_default = false
      RETURNING id`,
    [id, userId],
  );
  return rows.length > 0;
}

async function countTodosInCategory({ id, userId }) {
  const { rows } = await pool.query(
    'SELECT count(*)::int AS cnt FROM todos WHERE category_id = $1 AND user_id = $2',
    [id, userId],
  );
  return rows[0].cnt;
}

module.exports = {
  listForUser,
  findByIdForUser,
  findByUserAndName,
  create,
  updateForUser,
  deleteForUser,
  countTodosInCategory,
};
