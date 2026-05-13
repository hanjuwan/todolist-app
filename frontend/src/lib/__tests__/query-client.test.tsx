import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

describe('query-client', () => {
  it('단일 QueryClient 인스턴스를 export한다', () => {
    expect(queryClient).toBeInstanceOf(QueryClient);
  });

  it('기본 옵션: 4xx 에러는 재시도하지 않는다', () => {
    const opts = queryClient.getDefaultOptions().queries;
    expect(opts?.retry).toBeDefined();
    const retryFn = opts!.retry as (failure: number, err: unknown) => boolean;
    expect(retryFn(0, { status: 401 })).toBe(false);
    expect(retryFn(0, { status: 404 })).toBe(false);
  });

  it('기본 옵션: 5xx/네트워크 에러는 최대 2회 재시도', () => {
    const retryFn = queryClient.getDefaultOptions().queries!.retry as (
      f: number,
      e: unknown,
    ) => boolean;
    expect(retryFn(0, { status: 500 })).toBe(true);
    expect(retryFn(1, { status: 500 })).toBe(true);
    expect(retryFn(2, { status: 500 })).toBe(false);
  });

  it('mutations.retry=false', () => {
    expect(queryClient.getDefaultOptions().mutations?.retry).toBe(false);
  });

  it('QueryClientProvider로 래핑 시 useQuery 정상 동작', async () => {
    const localClient = new QueryClient();
    function Probe() {
      const q = useQuery({ queryKey: ['k'], queryFn: async () => 'ok' });
      return <div>{q.data ?? 'loading'}</div>;
    }
    render(
      <QueryClientProvider client={localClient}>
        <Probe />
      </QueryClientProvider>,
    );
    await waitFor(() => expect(screen.getByText('ok')).toBeTruthy());
  });
});
