const PALETTE_SIZE = 8;

function hashString(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export interface CategoryColor {
  bg: string;
  text: string;
  dot: string;
  index: number;
}

export function getCategoryColor(categoryId: string): CategoryColor {
  const index = (hashString(categoryId) % PALETTE_SIZE) + 1;
  return {
    bg: `var(--color-cat-${index}-bg)`,
    text: `var(--color-cat-${index}-text)`,
    dot: `var(--color-cat-${index}-dot)`,
    index,
  };
}
