'use strict';

const todosRepo = require('../todos.repository');
const catRepo = require('../../categories/categories.repository');
const service = require('../todos.service');

describe('todos.service (BR-T3, BR-T4, BR-U3)', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('toggleComplete true → repo에 isCompleted:true 전달 (BR-T3 completed_at 설정)', async () => {
    vi.spyOn(todosRepo, 'findByIdForUser').mockResolvedValue({ id: 't1', userId: 'u', isCompleted: false });
    const toggleSpy = vi.spyOn(todosRepo, 'toggleComplete').mockResolvedValue({
      id: 't1',
      isCompleted: true,
      completedAt: new Date(),
    });
    await service.toggleComplete('u', 't1', true);
    expect(toggleSpy).toHaveBeenCalledWith({ id: 't1', userId: 'u', isCompleted: true });
  });

  it('toggleComplete false → completed_at NULL', async () => {
    vi.spyOn(todosRepo, 'findByIdForUser').mockResolvedValue({ id: 't1', userId: 'u', isCompleted: true });
    vi.spyOn(todosRepo, 'toggleComplete').mockResolvedValue({
      id: 't1',
      isCompleted: false,
      completedAt: null,
    });
    const r = await service.toggleComplete('u', 't1', false);
    expect(r.completedAt).toBeNull();
  });

  it('update: 완료된 항목도 수정 허용 (BR-T4)', async () => {
    vi.spyOn(todosRepo, 'findByIdForUser').mockResolvedValue({
      id: 't1',
      userId: 'u',
      categoryId: 'cat1',
      isCompleted: true,
    });
    const updateSpy = vi.spyOn(todosRepo, 'updateForUser').mockResolvedValue({ id: 't1' });
    await service.update('u', 't1', { title: '새 제목' });
    expect(updateSpy).toHaveBeenCalled();
  });

  it('타 사용자 항목 조회 → 404 (BR-U3 격리)', async () => {
    vi.spyOn(todosRepo, 'findByIdForUser').mockResolvedValue(null);
    await expect(service.getById('intruder', 't1')).rejects.toMatchObject({
      statusCode: 404,
      code: 'TODO_NOT_FOUND',
    });
  });

  it('create: 접근 불가 카테고리 → 404 CATEGORY_NOT_FOUND', async () => {
    vi.spyOn(catRepo, 'findByIdForUser').mockResolvedValue(null);
    const createSpy = vi.spyOn(todosRepo, 'create');
    await expect(service.create('u', { categoryId: 'c-other', title: 't' })).rejects.toMatchObject({
      statusCode: 404,
      code: 'CATEGORY_NOT_FOUND',
    });
    expect(createSpy).not.toHaveBeenCalled();
  });
});
