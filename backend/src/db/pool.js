'use strict';

const { Pool, types } = require('pg');
const env = require('../config/env');

types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  connectionString: env.postgresConnectionString,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  console.error('[pg] idle client error', err);
});

async function healthCheck() {
  const { rows } = await pool.query('SELECT 1 AS ok');
  return rows[0]?.ok === 1;
}

async function shutdown() {
  await pool.end();
}

module.exports = { pool, healthCheck, shutdown };
