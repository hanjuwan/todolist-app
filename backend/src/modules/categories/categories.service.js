'use strict';

const repo = require('./categories.repository');
const { AppError } = require('../../utils/app-error');

async function list(userId) {
  console.log(`[categories.list] userId=${userId}`);
  const items = await repo.listForUser(userId);
  console.log(`[categories.list] success userId=${userId} count=${items.length}`);
  return items;
}

async function create(userId, { name }) {
  console.log(`[categories.create] start userId=${userId} name=${name}`);
  const dup = await repo.findByUserAndName(userId, name);
  if (dup) {
    console.log(`[categories.create] duplicated userId=${userId} name=${name}`);
    throw new AppError(409, 'CATEGORY_NAME_DUPLICATED', '이미 사용 중인 카테고리 이름입니다.');
  }
  const created = await repo.create({ userId, name });
  console.log(`[categories.create] success userId=${userId} categoryId=${created.id}`);
  return created;
}

async function update(userId, id, { name }) {
  console.log(`[categories.update] start userId=${userId} id=${id} name=${name}`);
  const existing = await repo.findByIdForUser(id, userId);
  if (!existing) throw new AppError(404, 'CATEGORY_NOT_FOUND', '카테고리를 찾을 수 없습니다.');
  if (existing.isDefault) {
    console.log(`[categories.update] default immutable userId=${userId} id=${id}`);
    throw new AppError(403, 'CATEGORY_DEFAULT_IMMUTABLE', '기본 카테고리는 수정할 수 없습니다.');
  }

  if (name !== existing.name) {
    const dup = await repo.findByUserAndName(userId, name);
    if (dup && dup.id !== id) {
      console.log(`[categories.update] duplicated userId=${userId} name=${name}`);
      throw new AppError(409, 'CATEGORY_NAME_DUPLICATED', '이미 사용 중인 카테고리 이름입니다.');
    }
  }

  const updated = await repo.updateForUser({ id, userId, name });
  console.log(`[categories.update] success userId=${userId} id=${id}`);
  return updated;
}

async function remove(userId, id) {
  console.log(`[categories.remove] start userId=${userId} id=${id}`);
  const existing = await repo.findByIdForUser(id, userId);
  if (!existing) throw new AppError(404, 'CATEGORY_NOT_FOUND', '카테고리를 찾을 수 없습니다.');
  if (existing.isDefault) {
    console.log(`[categories.remove] default immutable userId=${userId} id=${id}`);
    throw new AppError(403, 'CATEGORY_DEFAULT_IMMUTABLE', '기본 카테고리는 삭제할 수 없습니다.');
  }
  const linked = await repo.countTodosInCategory({ id, userId });
  if (linked > 0) {
    console.log(`[categories.remove] has todos userId=${userId} id=${id} linked=${linked}`);
    throw new AppError(
      409,
      'CATEGORY_HAS_TODOS',
      '연결된 할일이 있어 카테고리를 삭제할 수 없습니다.',
      { linkedTodoCount: linked },
    );
  }
  await repo.deleteForUser({ id, userId });
  console.log(`[categories.remove] success userId=${userId} id=${id}`);
}

module.exports = { list, create, update, remove };
