import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const mocks = vi.hoisted(() => ({ admin: {} as Record<string, unknown>, qiskit: vi.fn() }));
vi.mock('@/lib/supabase/server', async importOriginal => {
  const actual = await importOriginal<typeof import('@/lib/supabase/server')>();
  return { ...actual, createAdminClient: () => mocks.admin,
    createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: 'learner' } } }) } }),
    qiskit: mocks.qiskit, PYTHON_TYPES: ['sifting'], seedFrom: () => 0 };
});
vi.mock('@/lib/daily-challenge/rateLimit', () => ({ limitRoute: async () => null, llmAllowed: async () => false }));
import { GET as today } from './today/route';
import { GET as status } from './status/route';

type Row = Record<string, unknown>;
let rows: Row[];
let answers: Row[];
let attempts: Row[];
let failSecret: boolean;
function database() {
  return { from(table: string) {
    let action = 'select'; let value: Row = {}; const filters: [string, unknown][] = [];
    const matches = (row: Row) => filters.every(([key, expected]) => Array.isArray(expected) ? expected.includes(row[key]) : row[key] === expected);
    function execute(single: boolean) {
      if (table === 'daily_challenges' && action === 'upsert') {
        const existing = rows.find(row => row.user_id === value.user_id && row.date === value.date && row.difficulty === value.difficulty);
        if (!existing) rows.push({ id: `generated-${rows.length + 1}`, ...value, hints_revealed: 0 });
        return { data: existing ?? rows.at(-1), error: null };
      }
      if (table === 'daily_challenges' && action === 'delete') rows = rows.filter(row => !matches(row));
      if (table === 'daily_challenge_answers' && action === 'insert') {
        if (failSecret) return { data: null, error: { code: 'offline', message: 'fixture failure' } };
        answers.push(value);
      }
      const selected = (table === 'daily_challenges' ? rows : table === 'daily_challenge_answers' ? answers
        : table === 'challenge_attempts' ? attempts : table === 'profiles'
          ? [{ id: 'learner', xp: 100, challenge_streak: 1, best_streak: 3, last_challenge: '2026-10-27' }] : []).filter(matches);
      return { data: single ? selected[0] ?? null : selected, error: null };
    }
    const query = {
      select: () => query, eq: (key: string, expected: unknown) => { filters.push([key, expected]); return query; },
      in: (key: string, expected: unknown[]) => { filters.push([key, expected]); return query; }, order: () => query,
      upsert: (row: Row) => { action = 'upsert'; value = row; return query; },
      insert: (row: Row) => { action = 'insert'; value = row; return query; },
      delete: () => { action = 'delete'; return query; },
      maybeSingle: async () => execute(true), single: async () => execute(true),
      then: (resolve: (result: ReturnType<typeof execute>) => unknown) => Promise.resolve(execute(false)).then(resolve),
    };
    return query;
  } };
}
const request = () => new NextRequest('http://localhost/api/challenge/today?difficulty=2');
beforeEach(() => {
  rows = []; answers = []; attempts = []; failSecret = false;
  vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-10-27T12:59:59Z'));
  mocks.admin = database(); mocks.qiskit.mockReset().mockResolvedValue({ type: 'sifting', difficulty: 2, input_kind: 'bits',
    prompt_data: { rounds: [] }, options: [], answer: { bits: '101' }, worked_solution: 'Keep matching bases', leak_terms: ['101'] });
  vi.spyOn(console, 'info').mockImplementation(() => {}); vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe('Daily Challenge lifecycle using the real Melbourne date helper', () => {
  it('caches within one day and generates a new bucket at Melbourne midnight', async () => {
    const first = await (await today(request())).json();
    const repeated = await (await today(request())).json();
    expect(first.challenge.date).toBe('2026-10-27');
    expect(repeated.challenge.id).toBe(first.challenge.id);
    expect(mocks.qiskit).toHaveBeenCalledTimes(1);
    rows[0].hints_revealed = 2;
    attempts.push({ user_id: 'learner', challenge_id: first.challenge.id, attempt_no: 1, correct: true });
    vi.setSystemTime(new Date('2026-10-27T13:00:00Z'));
    const next = await (await today(request())).json();
    expect(next.challenge.date).toBe('2026-10-28');
    expect(next.challenge.id).not.toBe(first.challenge.id);
    expect(next.progress).toMatchObject({ attemptsUsed: 0, attemptsLeft: 3, hints: [], solved: false, workedSolution: null });
    expect(mocks.qiskit).toHaveBeenCalledTimes(2);
    expect(rows).toHaveLength(2);
    expect(JSON.stringify(next)).not.toContain('"bits":"101"');
  });
  it('resets the three-tier hub at midnight while keeping yesterday\'s streak alive', async () => {
    rows.push({ id: 'old', user_id: 'learner', date: '2026-10-27', difficulty: 2, title: 'Old challenge', type: 'sifting' });
    attempts.push({ user_id: 'learner', challenge_id: 'old', correct: true });
    expect((await (await status()).json()).completedToday).toBe(true);
    vi.setSystemTime(new Date('2026-10-27T13:00:00Z'));
    const next = await (await status()).json();
    expect(next.date).toBe('2026-10-28'); expect(next.completedToday).toBe(false);
    expect(next.tiers.every((tier: Row) => tier.started === false && tier.attemptsLeft === 3)).toBe(true);
    expect(next.streak).toMatchObject({ current: 1, best: 3, xp: 100 });
  });
  it('returns a retryable generation outage without storing a partial challenge', async () => {
    mocks.qiskit.mockRejectedValueOnce(new Error('service unavailable'));
    expect((await today(request())).status).toBe(503);
    expect(rows).toEqual([]); expect(answers).toEqual([]);
    expect((await today(request())).status).toBe(200);
    expect(rows).toHaveLength(1); expect(answers).toHaveLength(1);
  });
  it('removes the public row if private answer storage fails', async () => {
    failSecret = true;
    expect((await today(request())).status).toBe(500);
    expect(rows).toEqual([]); expect(answers).toEqual([]);
    failSecret = false;
    expect((await today(request())).status).toBe(200);
    expect(rows).toHaveLength(1); expect(answers).toHaveLength(1);
  });
});
