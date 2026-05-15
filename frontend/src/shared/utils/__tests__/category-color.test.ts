import { describe, it, expect } from 'vitest';
import { getCategoryColor } from '@/shared/utils/category-color';

describe('getCategoryColor', () => {
  it('동일한 categoryId는 항상 같은 색상을 반환한다', () => {
    const a = getCategoryColor('cat-1');
    const b = getCategoryColor('cat-1');
    expect(a).toEqual(b);
  });

  it('색상 인덱스는 1~8 범위에 있다', () => {
    for (const id of ['a', 'b', 'c', 'long-id-12345', '한글-id']) {
      const c = getCategoryColor(id);
      expect(c.index).toBeGreaterThanOrEqual(1);
      expect(c.index).toBeLessThanOrEqual(8);
    }
  });

  it('CSS 변수 형식의 색상값을 반환한다', () => {
    const c = getCategoryColor('cat-1');
    expect(c.bg).toMatch(/^var\(--color-cat-[1-8]-bg\)$/);
    expect(c.text).toMatch(/^var\(--color-cat-[1-8]-text\)$/);
    expect(c.dot).toMatch(/^var\(--color-cat-[1-8]-dot\)$/);
  });

  it('서로 다른 categoryId는 일반적으로 다른 색상을 반환한다 (분포 확인)', () => {
    const ids = ['업무', '개인', '기타', '학습', '마케팅 프로젝트', '취미', '여행', '운동'];
    const indices = new Set(ids.map((id) => getCategoryColor(id).index));
    expect(indices.size).toBeGreaterThanOrEqual(3);
  });
});
