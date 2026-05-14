import { describe, it, expect } from 'vitest';

describe('FE-01 smoke', () => {
  it('@/ alias resolves to src', async () => {
    const mod = await import('@/App');
    expect(mod.default).toBeTypeOf('function');
  });

  it('vite env types are available', () => {
    expect(typeof import.meta.env).toBe('object');
  });
});
