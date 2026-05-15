import { describe, it, expect } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '..');

const REQUIRED_DIRS = [
  'features/auth/components',
  'features/auth/hooks',
  'features/auth/api',
  'features/auth/store',
  'features/auth/types',
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
];

describe('FE-02 directory structure', () => {
  for (const rel of REQUIRED_DIRS) {
    it(`exists: src/${rel}`, () => {
      const p = path.join(SRC, rel);
      expect(existsSync(p), `missing dir: ${rel}`).toBe(true);
      expect(statSync(p).isDirectory()).toBe(true);
    });
  }
});

describe('FE-02 shared types', () => {
  it('ApiError is a class with code/status/message/details', async () => {
    const mod = await import('@/shared/types');
    const e = new mod.ApiError({
      code: 'VALIDATION_ERROR',
      message: '입력값이 올바르지 않습니다.',
      status: 400,
      details: [{ path: 'email', message: 'invalid' }],
    });
    expect(e).toBeInstanceOf(mod.ApiError);
    expect(e).toBeInstanceOf(Error);
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.status).toBe(400);
    expect(e.message).toBe('입력값이 올바르지 않습니다.');
    expect(e.details?.[0]?.path).toBe('email');
  });
});

describe('FE-02 feature domain types modules import', () => {
  it('auth.types module is importable', async () => {
    await expect(import('@/features/auth/types/auth.types')).resolves.toBeDefined();
  });
  it('user.types module is importable', async () => {
    await expect(import('@/features/users/types/user.types')).resolves.toBeDefined();
  });
  it('todo.types module is importable', async () => {
    await expect(import('@/features/todos/types/todo.types')).resolves.toBeDefined();
  });
  it('category.types module is importable', async () => {
    await expect(import('@/features/categories/types/category.types')).resolves.toBeDefined();
  });
});
