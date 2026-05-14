'use strict';

const usersRepo = require('./users.repository');
const { hashPassword, comparePassword } = require('../../utils/password');
const { AppError } = require('../../utils/app-error');

async function getMe(userId) {
  console.log(`[users.getMe] userId=${userId}`);
  const user = await usersRepo.findById(userId);
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
  return user;
}

async function updateMe(userId, payload) {
  const { name, currentPassword, newPassword } = payload;
  console.log(
    `[users.updateMe] userId=${userId} nameChange=${name !== undefined} passwordChange=${newPassword !== undefined}`,
  );

  let passwordHash;
  if (newPassword !== undefined) {
    const row = await usersRepo.findByIdWithHash(userId);
    if (!row) throw new AppError(404, 'USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
    const ok = await comparePassword(currentPassword, row.password_hash);
    if (!ok) {
      console.log(`[users.updateMe] invalid current password userId=${userId}`);
      throw new AppError(401, 'INVALID_CURRENT_PASSWORD', '현재 비밀번호가 올바르지 않습니다.');
    }
    passwordHash = await hashPassword(newPassword);
  }

  const updated = await usersRepo.updateById(userId, { name, passwordHash });
  if (!updated) throw new AppError(404, 'USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
  console.log(`[users.updateMe] success userId=${userId}`);
  return updated;
}

async function withdraw(userId, currentPassword) {
  console.log(`[users.withdraw] start userId=${userId}`);
  const row = await usersRepo.findByIdWithHash(userId);
  if (!row) throw new AppError(404, 'USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
  const ok = await comparePassword(currentPassword, row.password_hash);
  if (!ok) {
    console.log(`[users.withdraw] invalid current password userId=${userId}`);
    throw new AppError(401, 'INVALID_CURRENT_PASSWORD', '현재 비밀번호가 올바르지 않습니다.');
  }
  await usersRepo.deleteByIdInTransaction(userId);
  console.log(`[users.withdraw] success userId=${userId}`);
}

module.exports = { getMe, updateMe, withdraw };
