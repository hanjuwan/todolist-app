import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isIsoDate, formatIsoDate, today, ISO_DATE_REGEX } from '@/shared/utils/date';

describe('date utils', () => {
  it('ISO_DATE_REGEX 정상/비정상 매칭', () => {
    expect(ISO_DATE_REGEX.test('2026-05-13')).toBe(true);
    expect(ISO_DATE_REGEX.test('2026/05/13')).toBe(false);
    expect(ISO_DATE_REGEX.test('2026-5-13')).toBe(false);
  });

  it('isIsoDate: 유효 날짜', () => {
    expect(isIsoDate('2026-05-13')).toBe(true);
    expect(isIsoDate('2024-02-29')).toBe(true);
  });

  it('isIsoDate: 형식 불일치는 false', () => {
    expect(isIsoDate('20260513')).toBe(false);
    expect(isIsoDate('')).toBe(false);
  });

  it('isIsoDate: 존재하지 않는 날짜는 false', () => {
    expect(isIsoDate('2026-02-30')).toBe(false);
    expect(isIsoDate('2025-02-29')).toBe(false);
    expect(isIsoDate('2026-13-01')).toBe(false);
  });

  it('formatIsoDate: 0-padding 포함 YYYY-MM-DD', () => {
    expect(formatIsoDate(new Date(2026, 0, 3))).toBe('2026-01-03');
    expect(formatIsoDate(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  describe('today()', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('현재 날짜를 YYYY-MM-DD로 반환', () => {
      vi.setSystemTime(new Date(2026, 4, 13, 10, 0, 0));
      expect(today()).toBe('2026-05-13');
    });
  });
});
