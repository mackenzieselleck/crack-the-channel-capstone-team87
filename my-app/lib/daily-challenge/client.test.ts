import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiFailure, dailyApi, loadDraft, parseTier, saveDraft, toFailure } from './client';

const fetchMock = vi.fn();
let storage: Map<string, string>;
beforeEach(() => {
  storage = new Map();
  vi.stubGlobal('fetch', fetchMock.mockReset());
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('Daily Challenge browser API boundary', () => {
  it('loads status without allowing a stale fetch cache', async () => {
    fetchMock.mockResolvedValue(Response.json({ date: '2026-10-28' }));
    await expect(dailyApi.status()).resolves.toEqual({ date: '2026-10-28' });
    expect(fetchMock).toHaveBeenCalledWith('/api/challenge/status', { cache: 'no-store' });
  });
  it('requests the selected tier', async () => {
    fetchMock.mockResolvedValue(Response.json({ challenge: {} }));
    await dailyApi.today(3);
    expect(fetchMock).toHaveBeenCalledWith('/api/challenge/today?difficulty=3', { cache: 'no-store' });
  });
  it('posts the requested hint index', async () => {
    fetchMock.mockResolvedValue(Response.json({ hints: ['Compare bases'], hintsTotal: 3 }));
    await dailyApi.hint('challenge-a', 1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ challengeId: 'challenge-a', index: 1 });
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'POST', headers: { 'Content-Type': 'application/json' } });
  });
  it('sends the answer without a client-controlled XP reward', async () => {
    fetchMock.mockResolvedValue(Response.json({ correct: true }));
    await dailyApi.submit('challenge-a', { circuit: [] });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ challengeId: 'challenge-a', submission: { circuit: [] } });
  });
  it('reports a network outage without claiming an HTTP response', async () => {
    fetchMock.mockRejectedValue(new TypeError('network unavailable'));
    await expect(dailyApi.status()).rejects.toMatchObject({ status: 0, message: expect.stringContaining('offline') });
  });
  it('preserves the server retry interval for a rate limit', async () => {
    fetchMock.mockResolvedValue(Response.json({ error: 'Slow down', retryAfter: 42 }, { status: 429 }));
    await expect(dailyApi.status()).rejects.toMatchObject({ status: 429, retryAfter: 42, message: 'Slow down' });
  });
  it.each([[401, 'Your session has ended.'], [503, 'Something went wrong. Please try again.']])(
    'provides safe feedback for a non-JSON HTTP %i', async (status, message) => {
      fetchMock.mockResolvedValue(new Response('not JSON', { status: Number(status) }));
      await expect(dailyApi.status()).rejects.toMatchObject({ status, message });
    });
  it('preserves an existing API error and hides unexpected exception details', () => {
    const failure = new ApiFailure('Expired', 410);
    expect(toFailure(failure)).toBe(failure);
    expect(toFailure(new Error('private service details'))).toMatchObject({ status: 500, message: 'Something went wrong. Please try again.' });
  });
});

describe('tier navigation and answer drafts', () => {
  it.each(['1', '2', '3'])('accepts supported tier %s', raw => expect(parseTier(raw)).toBe(Number(raw)));
  it.each([undefined, '', '0', '4', '-1', 'not-a-tier'])('rejects unsupported tier %s', raw => expect(parseTier(raw)).toBeNull());
  it('keeps drafts separate for different challenges', () => {
    saveDraft('one', { bits: '101' });
    saveDraft('two', { text: '1/sqrt(3)' });
    expect(loadDraft('one')).toEqual({ bits: '101' });
    expect(loadDraft('two')).toEqual({ text: '1/sqrt(3)' });
    expect(loadDraft('missing')).toBeNull();
  });
  it('recovers from malformed stored JSON', () => {
    storage.set('dc-draft:bad', '{');
    expect(loadDraft('bad')).toBeNull();
  });
  it('keeps the page usable when session storage is unavailable', () => {
    vi.stubGlobal('sessionStorage', { getItem: () => { throw Error('blocked'); }, setItem: () => { throw Error('blocked'); } });
    expect(() => saveDraft('one', { bits: '1' })).not.toThrow();
    expect(loadDraft('one')).toBeNull();
  });
});
