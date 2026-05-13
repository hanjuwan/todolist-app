'use strict';

const { pool } = require('../../db/pool');

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findByEmail(email) {
  const { rows } = await pool.query(
    'SELECT id, email, password_hash, name, created_at, updated_at FROM users WHERE email = $1',
    [email],
  );
  return rows[0] || null; // password_hash 포함 — service에서만 사용
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1',
    [id],
  );
  return mapRow(rows[0]);
}

async function findByIdWithHash(id) {
  const { rows } = await pool.query(
    'SELECT id, email, password_hash, name, created_at, updated_at FROM users WHERE id = $1',
    [id],
  );
  return rows[0] || null;
}

async function create({ email, passwordHash, name }) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, created_at, updated_at`,
    [email, passwordHash, name],
  );
  return mapRow(rows[0]);
}

async function updateById(id, { name, passwordHash }) {
  const fields = [];
  const params = [];
  let i = 1;

  if (name !== undefined) {
    fields.push(`name = $${i++}`);
    params.push(name);
  }
  if (passwordHash !== undefined) {
    fields.push(`password_hash = $${i++}`);
    params.push(passwordHash);
  }
  if (fields.length === 0) return findById(id);

  fields.push(`updated_at = now()`);
  params.push(id);

  const { rows } = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, email, name, created_at, updated_at`,
    params,
  );
  return mapRow(rows[0]);
}

/**
 * 회원 탈퇴 (BR-U4 하드 삭제). FK ON DELETE CASCADE로 todos·사용자 카테고리 자동 정리.
 * 명시적 트랜잭션으로 감싸 일관성 보장. 실패 시 ROLLBACK + client.release().
 */
async function deleteByIdInTransaction(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rowCount } = await client.query('DELETE FROM users WHERE id = $1', [id]);
    await client.query('COMMIT');
    return rowCount > 0;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  findByEmail,
  findById,
  findByIdWithHash,
  create,
  updateById,
  deleteByIdInTransaction,
};
