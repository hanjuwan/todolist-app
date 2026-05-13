'use strict';

const usersRepo = require('./users.repository');
const { hashPassword, comparePassword } = require('../../utils/password');
const { AppError } = require('../../utils/app-error');

async function getMe(userId) {
  const user = await usersRepo.findById(userId);
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
  return user;
}

async function updateMe(userId, payload) {
  const { name, currentPassword, newPassword } = payload;

  let passwordHash;
  if (newPassword !== undefined) {
    const row = await usersRepo.findByIdWithHash(userId);
    if (!row) throw new AppError(404, 'USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
    const ok = await comparePassword(currentPassword, row.password_hash);
    if (!ok) throw new AppError(401, 'INVALID_CURRENT_PASSWORD', '현재 비밀번호가 올바르지 않습니다.');
    passwordHash = await hashPassword(newPassword);
  }

  const updated = await usersRepo.updateById(userId, { name, passwordHash });
  if (!updated) throw new AppError(404, 'USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
  return updated;
}

async function withdraw(userId, currentPassword) {
  const row = await usersRepo.findByIdWithHash(userId);
  if (!row) throw new AppError(404, 'USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
  const ok = await comparePassword(currentPassword, row.password_hash);
  if (!ok) throw new AppError(401, 'INVALID_CURRENT_PASSWORD', '현재 비밀번호가 올바르지 않습니다.');
  await usersRepo.deleteByIdInTransaction(userId);
}

module.exports = { getMe, updateMe, withdraw };
