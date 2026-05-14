'use strict';

const usersRepo = require('../users/users.repository');
const { hashPassword, comparePassword } = require('../../utils/password');
const { signToken } = require('../../utils/jwt');
const { AppError } = require('../../utils/app-error');

async function register({ email, password, name }) {
  console.log(`[auth.register] start email=${email}`);
  const existing = await usersRepo.findByEmail(email);
  if (existing) {
    console.log(`[auth.register] duplicated email=${email}`);
    throw new AppError(409, 'EMAIL_DUPLICATED', '이미 가입된 이메일입니다.');
  }
  const passwordHash = await hashPassword(password);
  const created = await usersRepo.create({ email, passwordHash, name });
  console.log(`[auth.register] success userId=${created.id} email=${email}`);
  return created;
}

async function login({ email, password }) {
  console.log(`[auth.login] start email=${email}`);
  const row = await usersRepo.findByEmail(email);
  if (!row) {
    console.log(`[auth.login] no user email=${email}`);
    throw new AppError(401, 'INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다.');
  }
  const ok = await comparePassword(password, row.password_hash);
  if (!ok) {
    console.log(`[auth.login] bad password userId=${row.id}`);
    throw new AppError(401, 'INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다.');
  }
  const accessToken = signToken({ sub: row.id });
  console.log(`[auth.login] success userId=${row.id}`);
  return {
    accessToken,
    user: { id: row.id, email: row.email, name: row.name },
  };
}

module.exports = { register, login };
