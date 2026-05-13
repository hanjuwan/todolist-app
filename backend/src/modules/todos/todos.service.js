'use strict';

const repo = require('./todos.repository');
const categoriesRepo = require('../categories/categories.repository');
const { AppError } = require('../../utils/app-error');

async function ensureCategoryAccessible(userId, categoryId) {
  const cat = await categoriesRepo.findByIdForUser(categoryId, userId);
  if (!cat) throw new AppError(404, 'CATEGORY_NOT_FOUND', '카테고리를 찾을 수 없습니다.');
}

async function list(userId, filters) {
  return repo.listForUser(userId, filters);
}

async function getById(userId, id) {
  const todo = await repo.findByIdForUser(id, userId);
  if (!todo) throw new AppError(404, 'TODO_NOT_FOUND', '할일을 찾을 수 없습니다.');
  return todo;
}

async function create(userId, payload) {
  await ensureCategoryAccessible(userId, payload.categoryId);
  return repo.create({
    userId,
    categoryId: payload.categoryId,
    title: payload.title,
    description: payload.description,
    dueDate: payload.dueDate,
  });
}

async function update(userId, id, payload) {
  const existing = await repo.findByIdForUser(id, userId);
  if (!existing) throw new AppError(404, 'TODO_NOT_FOUND', '할일을 찾을 수 없습니다.');

  if (payload.categoryId !== undefined && payload.categoryId !== existing.categoryId) {
    await ensureCategoryAccessible(userId, payload.categoryId);
  }

  const fields = {};
  if (payload.categoryId !== undefined) fields.category_id = payload.categoryId;
  if (payload.title !== undefined) fields.title = payload.title;
  if (payload.description !== undefined) fields.description = payload.description;
  if (payload.dueDate !== undefined) fields.due_date = payload.dueDate;

  return repo.updateForUser({ id, userId, fields });
}

async function toggleComplete(userId, id, isCompleted) {
  const existing = await repo.findByIdForUser(id, userId);
  if (!existing) throw new AppError(404, 'TODO_NOT_FOUND', '할일을 찾을 수 없습니다.');
  return repo.toggleComplete({ id, userId, isCompleted });
}

async function remove(userId, id) {
  const ok = await repo.deleteForUser({ id, userId });
  if (!ok) throw new AppError(404, 'TODO_NOT_FOUND', '할일을 찾을 수 없습니다.');
}

module.exports = { list, getById, create, update, toggleComplete, remove };
