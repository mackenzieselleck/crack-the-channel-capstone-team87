import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({ rpc }),
}));

import { limitRoute, llmAllowed } from './rateLimit';

const allowed = { data: [{ allowed: true, retry_after: 0 }], error: null };
const denied = { data: [{ allowed: false, retry_after: 30 }], error: null };

beforeEach(() => {
  rpc.mockReset().mockResolvedValue(allowed);
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe('LLM cost budget', () => {
  it('permits a model job only when every budget window permits it', async () => {
    await expect(llmAllowed('learner')).resolves.toBe(true);
    expect(rpc.mock.calls.map(([, args]) => [args.p_key, args.p_window_seconds])).toEqual([
      ['llm:user:learner', 3600],
      ['llm:global:min', 60],
      ['llm:global:day', 86_400],
    ]);
  });

  it.each([0, 1, 2])('stops when budget window %i denies the job', async (window) => {
    for (let i = 0; i < window; i++) rpc.mockResolvedValueOnce(allowed);
    rpc.mockResolvedValueOnce(denied);
    await expect(llmAllowed('learner')).resolves.toBe(false);
    expect(rpc).toHaveBeenCalledTimes(window + 1);
  });

  it.each([0, 1, 2])('fails closed when budget window %i returns a database error', async (window) => {
    for (let i = 0; i < window; i++) rpc.mockResolvedValueOnce(allowed);
    rpc.mockResolvedValueOnce({ data: null, error: { message: 'database unavailable' } });
    await expect(llmAllowed('learner')).resolves.toBe(false);
    expect(rpc).toHaveBeenCalledTimes(window + 1);
  });

  it.each([0, 1, 2])('fails closed when budget window %i throws', async (window) => {
    for (let i = 0; i < window; i++) rpc.mockResolvedValueOnce(allowed);
    rpc.mockRejectedValueOnce(new Error('network unavailable'));
    await expect(llmAllowed('learner')).resolves.toBe(false);
    expect(rpc).toHaveBeenCalledTimes(window + 1);
  });

  it.each([
    null,
    [],
    {},
    [null],
    [{}],
    [{ allowed: 'true', retry_after: 0 }],
    [{ allowed: true }],
    [{ allowed: true, retry_after: '0' }],
    [{ allowed: true, retry_after: -1 }],
    [{ allowed: true, retry_after: Number.NaN }],
    [{ allowed: true, retry_after: Infinity }],
    [{ allowed: true, retry_after: 0.5 }],
    [{ allowed: false, retry_after: 0 }],
    [{ allowed: true, retry_after: 0 }, { allowed: true, retry_after: 0 }],
  ])('skips model work for malformed budget data: %j', async (data) => {
    rpc.mockResolvedValueOnce({ data, error: null });
    await expect(llmAllowed('learner')).resolves.toBe(false);
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});

describe('route access limits', () => {
  it('allows a route request when its normal limit is available', async () => {
    await expect(limitRoute('learner', 'today')).resolves.toBeNull();
    expect(rpc).toHaveBeenCalledWith('rate_limit_hit', {
      p_key: 'route:today:learner:60', p_limit: 30, p_window_seconds: 60,
    });
  });

  it.each([
    { data: null, error: { message: 'database unavailable' } },
    { data: [], error: null },
    { data: [{ allowed: 'false', retry_after: 30 }], error: null },
  ])('keeps route access available on an unavailable/invalid check: %j', async (result) => {
    rpc.mockResolvedValueOnce(result);
    await expect(limitRoute('learner', 'today')).resolves.toBeNull();
  });

  it('keeps route access available if the RPC throws', async () => {
    rpc.mockRejectedValueOnce(new Error('network unavailable'));
    await expect(limitRoute('learner', 'today')).resolves.toBeNull();
  });

  it('returns 429 and a retry interval when the normal route limit denies access', async () => {
    rpc.mockResolvedValueOnce(denied);
    const response = await limitRoute('learner', 'today');
    expect(response?.status).toBe(429);
    expect(response?.headers.get('Retry-After')).toBe('30');
    expect(await response?.json()).toEqual({
      error: 'Too many requests. Take a breather and try again shortly.', retryAfter: 30,
    });
  });

  it('checks both submission windows and preserves a later denial', async () => {
    rpc.mockResolvedValueOnce(allowed).mockResolvedValueOnce(denied);
    const response = await limitRoute('learner', 'submit');
    expect(response?.status).toBe(429);
    expect(rpc.mock.calls.map(([, args]) => args.p_window_seconds)).toEqual([60, 3600]);
  });
});
