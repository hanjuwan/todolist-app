import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

describe('query-client defaults', () => {
  it('단일 인스턴스로 export 된다 (QueryClient 인스턴스)', () => {
    expect(queryClient).toBeInstanceOf(QueryClient);
  });

  it('queries 기본값: staleTime=30s, gcTime=5min, refetchOnWindowFocus=false', () => {
    const defaults = queryClient.getDefaultOptions().queries;
    expect(defaults?.staleTime).toBe(30_000);
    expect(defaults?.gcTime).toBe(5 * 60_000);
    expect(defaults?.refetchOnWindowFocus).toBe(false);
  });

  it('retry: 4xx 에러는 즉시 중단 (false)', () => {
    const defaults = queryClient.getDefaultOptions().queries;
    const retry = defaults?.retry;
    if (typeof retry !== 'function') throw new Error('retry must be function');
    expect(retry(0, { status: 400 } as unknown as Error)).toBe(false);
    expect(retry(0, { status: 404 } as unknown as Error)).toBe(false);
  });

  it('retry: 5xx 에러는 최대 2회 재시도 (3번째 실패 시 중단)', () => {
    const defaults = queryClient.getDefaultOptions().queries;
    const retry = defaults?.retry;
    if (typeof retry !== 'function') throw new Error('retry must be function');
    expect(retry(0, { status: 500 } as unknown as Error)).toBe(true);
    expect(retry(1, { status: 500 } as unknown as Error)).toBe(true);
    expect(retry(2, { status: 500 } as unknown as Error)).toBe(false);
  });

  it('mutations.retry = false', () => {
    const defaults = queryClient.getDefaultOptions().mutations;
    expect(defaults?.retry).toBe(false);
  });
});

describe('QueryClientProvider 통합 렌더링', () => {
  it('Provider로 자식 컴포넌트를 정상 렌더링한다', () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <div>provider-child</div>
      </QueryClientProvider>,
    );
    expect(getByText('provider-child')).toBeTruthy();
  });
});
