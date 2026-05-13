import { describe, it, expect } from 'vitest';

describe('FE-01 scaffold smoke test', () => {
  it('@/ alias resolves to src/', async () => {
    const mod = await import('@/App');
    expect(mod.default).toBeTypeOf('function');
  });

  it('vite env types are loaded', () => {
    expect(import.meta.env).toBeDefined();
  });
});
