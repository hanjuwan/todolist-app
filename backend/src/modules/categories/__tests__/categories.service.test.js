'use strict';

const repo = require('../categories.repository');
const service = require('../categories.service');

describe('categories.service (BR-C1, BR-C3, BR-C4)', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('update: 기본 카테고리 → 403 CATEGORY_DEFAULT_IMMUTABLE (BR-C1)', async () => {
    vi.spyOn(repo, 'findByIdForUser').mockResolvedValue({ id: 'c1', name: '업무', isDefault: true });
    await expect(service.update('u', 'c1', { name: 'x' })).rejects.toMatchObject({
      statusCode: 403,
      code: 'CATEGORY_DEFAULT_IMMUTABLE',
    });
  });

  it('delete: 기본 카테고리 → 403 (BR-C1)', async () => {
    vi.spyOn(repo, 'findByIdForUser').mockResolvedValue({ id: 'c1', name: '개인', isDefault: true });
    const delSpy = vi.spyOn(repo, 'deleteForUser');
    await expect(service.remove('u', 'c1')).rejects.toMatchObject({
      statusCode: 403,
      code: 'CATEGORY_DEFAULT_IMMUTABLE',
    });
    expect(delSpy).not.toHaveBeenCalled();
  });

  it('create: 동일 사용자 내 이름 중복 → 409 (BR-C3)', async () => {
    vi.spyOn(repo, 'findByUserAndName').mockResolvedValue({ id: 'dup' });
    await expect(service.create('u', { name: '운동' })).rejects.toMatchObject({
      statusCode: 409,
      code: 'CATEGORY_NAME_DUPLICATED',
    });
  });

  it('delete: 연결된 할일 존재 → 409 CATEGORY_HAS_TODOS (BR-C4)', async () => {
    vi.spyOn(repo, 'findByIdForUser').mockResolvedValue({ id: 'c2', name: '운동', isDefault: false });
    vi.spyOn(repo, 'countTodosInCategory').mockResolvedValue(3);
    await expect(service.remove('u', 'c2')).rejects.toMatchObject({
      statusCode: 409,
      code: 'CATEGORY_HAS_TODOS',
      details: { linkedTodoCount: 3 },
    });
  });

  it('delete: 빈 사용자 카테고리 → 정상 삭제', async () => {
    vi.spyOn(repo, 'findByIdForUser').mockResolvedValue({ id: 'c3', name: '취미', isDefault: false });
    vi.spyOn(repo, 'countTodosInCategory').mockResolvedValue(0);
    const delSpy = vi.spyOn(repo, 'deleteForUser').mockResolvedValue(true);
    await service.remove('u', 'c3');
    expect(delSpy).toHaveBeenCalledWith({ id: 'c3', userId: 'u' });
  });

  it('update: 존재하지 않는 카테고리 → 404', async () => {
    vi.spyOn(repo, 'findByIdForUser').mockResolvedValue(null);
    await expect(service.update('u', 'ghost', { name: 'x' })).rejects.toMatchObject({
      statusCode: 404,
      code: 'CATEGORY_NOT_FOUND',
    });
  });
});
