import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ISO_DATE_REGEX, isIsoDate, formatIsoDate, today } from '@/shared/utils/date';

describe('ISO_DATE_REGEX', () => {
  it('YYYY-MM-DD 형식만 매치', () => {
    expect(ISO_DATE_REGEX.test('2026-05-14')).toBe(true);
    expect(ISO_DATE_REGEX.test('2026/05/14')).toBe(false);
    expect(ISO_DATE_REGEX.test('2026-5-14')).toBe(false);
  });
});

describe('isIsoDate', () => {
  it('정상 날짜 true', () => {
    expect(isIsoDate('2026-05-14')).toBe(true);
  });
  it('윤년 2024-02-29 true', () => {
    expect(isIsoDate('2024-02-29')).toBe(true);
  });
  it('평년 2026-02-29 false', () => {
    expect(isIsoDate('2026-02-29')).toBe(false);
  });
  it('존재하지 않는 날짜 2026-13-01 false', () => {
    expect(isIsoDate('2026-13-01')).toBe(false);
  });
  it('형식 불일치 false', () => {
    expect(isIsoDate('2026/05/14')).toBe(false);
  });
});

describe('formatIsoDate', () => {
  it('Date 객체를 YYYY-MM-DD로 포맷', () => {
    expect(formatIsoDate(new Date(2026, 4, 14))).toBe('2026-05-14');
  });
  it('한 자리 월·일도 0-padding', () => {
    expect(formatIsoDate(new Date(2026, 0, 3))).toBe('2026-01-03');
  });
});

describe('today', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 14));
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it('오늘 날짜를 YYYY-MM-DD로 반환', () => {
    expect(today()).toBe('2026-05-14');
  });
});
