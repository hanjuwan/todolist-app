'use strict';

const repo = require('./categories.repository');
const { AppError } = require('../../utils/app-error');

async function list(userId) {
  return repo.listForUser(userId);
}

async function create(userId, { name }) {
  const dup = await repo.findByUserAndName(userId, name);
  if (dup) {
    throw new AppError(409, 'CATEGORY_NAME_DUPLICATED', '이미 사용 중인 카테고리 이름입니다.');
  }
  return repo.create({ userId, name });
}

async function update(userId, id, { name }) {
  const existing = await repo.findByIdForUser(id, userId);
  if (!existing) throw new AppError(404, 'CATEGORY_NOT_FOUND', '카테고리를 찾을 수 없습니다.');
  if (existing.isDefault) {
    throw new AppError(403, 'CATEGORY_DEFAULT_IMMUTABLE', '기본 카테고리는 수정할 수 없습니다.');
  }

  if (name !== existing.name) {
    const dup = await repo.findByUserAndName(userId, name);
    if (dup && dup.id !== id) {
      throw new AppError(409, 'CATEGORY_NAME_DUPLICATED', '이미 사용 중인 카테고리 이름입니다.');
    }
  }

  return repo.updateForUser({ id, userId, name });
}

async function remove(userId, id) {
  const existing = await repo.findByIdForUser(id, userId);
  if (!existing) throw new AppError(404, 'CATEGORY_NOT_FOUND', '카테고리를 찾을 수 없습니다.');
  if (existing.isDefault) {
    throw new AppError(403, 'CATEGORY_DEFAULT_IMMUTABLE', '기본 카테고리는 삭제할 수 없습니다.');
  }
  const linked = await repo.countTodosInCategory({ id, userId });
  if (linked > 0) {
    throw new AppError(
      409,
      'CATEGORY_HAS_TODOS',
      '연결된 할일이 있어 카테고리를 삭제할 수 없습니다.',
      { linkedTodoCount: linked },
    );
  }
  await repo.deleteForUser({ id, userId });
}

module.exports = { list, create, update, remove };
