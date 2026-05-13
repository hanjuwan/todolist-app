import { describe, it, expect } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..');

function isDir(p: string): boolean {
  return existsSync(p) && statSync(p).isDirectory();
}

describe('FE-02: 디렉토리 구조 / 공통 타입', () => {
  it.each([
    'features/auth/components',
    'features/auth/hooks',
    'features/auth/api',
    'features/auth/types',
    'features/auth/store',
    'features/todos/components',
    'features/todos/hooks',
    'features/todos/api',
    'features/todos/types',
    'features/categories/components',
    'features/categories/hooks',
    'features/categories/api',
    'features/categories/types',
    'features/users/components',
    'features/users/hooks',
    'features/users/api',
    'features/users/types',
    'shared/components',
    'shared/hooks',
    'shared/utils',
    'shared/types',
    'lib',
    'pages',
    'routes',
  ])('디렉토리가 존재한다: %s', (rel) => {
    expect(isDir(path.join(root, rel))).toBe(true);
  });

  it('shared/types에 ApiError가 정의되어 있고 인스턴스 생성 가능', async () => {
    const mod = await import('@/shared/types');
    expect(mod.ApiError).toBeDefined();
    const err = new mod.ApiError(400, 'VALIDATION_ERROR', 'bad', [
      { path: 'email', message: 'invalid' },
    ]);
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details?.[0]?.path).toBe('email');
  });

  it('도메인 타입 모듈이 모두 로드 가능', async () => {
    await expect(import('@/features/auth/types/auth.types')).resolves.toBeDefined();
    await expect(import('@/features/todos/types/todo.types')).resolves.toBeDefined();
    await expect(import('@/features/categories/types/category.types')).resolves.toBeDefined();
    await expect(import('@/features/users/types/user.types')).resolves.toBeDefined();
  });
});
