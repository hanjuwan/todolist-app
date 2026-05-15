'use strict';

const repo = require('./todos.repository');
const categoriesRepo = require('../categories/categories.repository');
const { AppError } = require('../../utils/app-error');

async function ensureCategoryAccessible(userId, categoryId) {
  const cat = await categoriesRepo.findByIdForUser(categoryId, userId);
  if (!cat) {
    console.log(`[todos] category not found userId=${userId} categoryId=${categoryId}`);
    throw new AppError(404, 'CATEGORY_NOT_FOUND', '카테고리를 찾을 수 없습니다.');
  }
}

async function list(userId, filters) {
  console.log(`[todos.list] userId=${userId} filters=${JSON.stringify(filters)}`);
  const result = await repo.listForUser(userId, filters);
  console.log(`[todos.list] success userId=${userId} count=${result.items.length}`);
  return result;
}

async function getById(userId, id) {
  console.log(`[todos.getById] userId=${userId} id=${id}`);
  const todo = await repo.findByIdForUser(id, userId);
  if (!todo) throw new AppError(404, 'TODO_NOT_FOUND', '할일을 찾을 수 없습니다.');
  return todo;
}

async function create(userId, payload) {
  console.log(`[todos.create] start userId=${userId} categoryId=${payload.categoryId} title=${payload.title}`);
  await ensureCategoryAccessible(userId, payload.categoryId);
  const created = await repo.create({
    userId,
    categoryId: payload.categoryId,
    title: payload.title,
    description: payload.description,
    startDate: payload.startDate,
    dueDate: payload.dueDate,
  });
  console.log(`[todos.create] success userId=${userId} todoId=${created.id}`);
  return created;
}

async function update(userId, id, payload) {
  console.log(`[todos.update] start userId=${userId} id=${id} fields=${Object.keys(payload).join(',')}`);
  const existing = await repo.findByIdForUser(id, userId);
  if (!existing) throw new AppError(404, 'TODO_NOT_FOUND', '할일을 찾을 수 없습니다.');

  if (payload.categoryId !== undefined && payload.categoryId !== existing.categoryId) {
    await ensureCategoryAccessible(userId, payload.categoryId);
  }

  const fields = {};
  if (payload.categoryId !== undefined) fields.category_id = payload.categoryId;
  if (payload.title !== undefined) fields.title = payload.title;
  if (payload.description !== undefined) fields.description = payload.description;
  if (payload.startDate !== undefined) fields.start_date = payload.startDate;
  if (payload.dueDate !== undefined) fields.due_date = payload.dueDate;

  const updated = await repo.updateForUser({ id, userId, fields });
  console.log(`[todos.update] success userId=${userId} id=${id}`);
  return updated;
}

async function toggleComplete(userId, id, isCompleted) {
  console.log(`[todos.toggleComplete] userId=${userId} id=${id} isCompleted=${isCompleted}`);
  const existing = await repo.findByIdForUser(id, userId);
  if (!existing) throw new AppError(404, 'TODO_NOT_FOUND', '할일을 찾을 수 없습니다.');
  const updated = await repo.toggleComplete({ id, userId, isCompleted });
  console.log(`[todos.toggleComplete] success userId=${userId} id=${id}`);
  return updated;
}

async function remove(userId, id) {
  console.log(`[todos.remove] start userId=${userId} id=${id}`);
  const ok = await repo.deleteForUser({ id, userId });
  if (!ok) throw new AppError(404, 'TODO_NOT_FOUND', '할일을 찾을 수 없습니다.');
  console.log(`[todos.remove] success userId=${userId} id=${id}`);
}

module.exports = { list, getById, create, update, toggleComplete, remove };
