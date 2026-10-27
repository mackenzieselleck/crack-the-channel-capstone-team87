import { afterEach, describe, expect, it, vi } from 'vitest';
import { melbourneDate, qiskit, seededRandom, seedFrom } from './server';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('actual Melbourne calendar date', () => {
  it.each([
    ['2026-01-01T12:59:59Z', '2026-01-01'], ['2026-01-01T13:00:00Z', '2026-01-02'],
    ['2026-06-01T13:59:59Z', '2026-06-01'], ['2026-06-01T14:00:00Z', '2026-06-02'],
    ['2026-10-03T15:59:59Z', '2026-10-04'], ['2026-10-03T16:00:00Z', '2026-10-04'],
    ['2026-04-04T15:59:59Z', '2026-04-05'], ['2026-04-04T16:00:00Z', '2026-04-05'],
    ['2028-02-28T13:00:00Z', '2028-02-29'],
  ])('%s maps to %s including midnight, DST and leap day', (instant, expected) => {
    vi.useFakeTimers(); vi.setSystemTime(new Date(instant));
    expect(melbourneDate()).toBe(expected);
  });
});

describe('stable challenge seeding', () => {
  it.each([['', 2166136261], ['a', 3826002220], ['hello', 1335831723]])('matches FNV-1a fixture %s', (text, expected) => expect(seedFrom(String(text))).toBe(expected));
  it('separates user, date and tier fixture seeds', () => {
    const seeds = ['alice:2026-10-28:1', 'bob:2026-10-28:1', 'alice:2026-10-29:1', 'alice:2026-10-28:2'].map(seedFrom);
    expect(new Set(seeds).size).toBe(4);
  });
  it('repeats seeded shuffles while keeping draws in [0,1)', () => {
    const first = seededRandom(123), again = seededRandom(123);
    const draws = Array.from({ length: 100 }, () => first());
    expect(draws).toEqual(Array.from({ length: 100 }, () => again()));
    expect(draws.every(value => value >= 0 && value < 1)).toBe(true);
  });
});

describe('actual Qiskit HTTP helper', () => {
  it('sends JSON to the configured service with an internal key and no cache', async () => {
    vi.stubEnv('QISKIT_SERVICE_URL', 'http://qiskit.test'); vi.stubEnv('INTERNAL_API_KEY', 'fixture-key');
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ correct: true })); vi.stubGlobal('fetch', fetchMock);
    expect(await qiskit('/challenges/grade', { submission: { text: '1/sqrt(3)' } })).toEqual({ correct: true });
    expect(fetchMock).toHaveBeenCalledWith('http://qiskit.test/challenges/grade', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': 'fixture-key' },
      body: JSON.stringify({ submission: { text: '1/sqrt(3)' } }), cache: 'no-store',
    });
  });
  it('rejects an unavailable service rather than treating an error body as a grade', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('offline', { status: 503 })));
    await expect(qiskit('/challenges/grade', {})).rejects.toThrow('failed: 503');
  });
});
