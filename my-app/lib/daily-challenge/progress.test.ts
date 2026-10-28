import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/supabase/server', () => ({ MAX_ATTEMPTS: 3 }));
import { loadProgress, loadStreak, previousDate, PUBLIC_COLS } from './progress';

type Attempt = { attempt_no: number; correct: boolean; feedback: string; xp_awarded: number | null; created_at: string };
function fixture(attempts: Attempt[], profile: Record<string, unknown> | null = null) {
  const reads: { table: string; filters: [string, unknown][] }[] = [];
  const from = (table: string) => {
    const record = { table, filters: [] as [string, unknown][] };
    reads.push(record);
    const query = {
      select: () => query,
      eq: (key: string, value: unknown) => { record.filters.push([key, value]); return query; },
      order: async () => ({ data: attempts }),
      maybeSingle: async () => ({ data: table === 'profiles' ? profile : { worked_solution: 'Private solution' } }),
    };
    return query;
  };
  return { admin: { from } as unknown as SupabaseClient, reads };
}
const attempt = (n: number, correct = false): Attempt => ({ attempt_no: n, correct, feedback: 'Compare bases', xp_awarded: correct ? 25 : null, created_at: '2026-10-28T00:00:00Z' });

describe('progress, solution visibility and read ownership', () => {
  it.each([
    { label: 'new challenge', attempts: [], left: 3, reveal: false, solved: false },
    { label: 'one wrong answer', attempts: [attempt(1)], left: 2, reveal: false, solved: false },
    { label: 'two wrong answers', attempts: [attempt(1), attempt(2)], left: 1, reveal: false, solved: false },
    { label: 'three wrong answers', attempts: [attempt(1), attempt(2), attempt(3)], left: 0, reveal: true, solved: false },
    { label: 'a correct answer', attempts: [attempt(1), attempt(2, true)], left: 0, reveal: true, solved: true },
  ])('$label returns the correct remaining attempts and solution visibility', async ({ attempts, left, reveal, solved }) => {
    const { admin, reads } = fixture(attempts);
    const result = await loadProgress(admin, 'learner', 'challenge', ['hint one', 'hint two', 'hint three'], 1);
    expect(result).toMatchObject({ attemptsUsed: attempts.length, attemptsLeft: left, solved, hints: ['hint one'], hintsTotal: 3,
      workedSolution: reveal ? 'Private solution' : null });
    expect(reads[0].filters).toEqual([['user_id', 'learner'], ['challenge_id', 'challenge']]);
    expect(reads.some(read => read.table === 'daily_challenge_answers')).toBe(reveal);
    expect(result.lastAttempt?.attemptNo ?? null).toBe(attempts.at(-1)?.attempt_no ?? null);
  });
  it('never exposes private answer columns as public challenge fields', () => {
    const columns = PUBLIC_COLS.split(',');
    for (const field of ['answer', 'worked_solution', 'leak_terms', 'hints', 'seed']) expect(columns).not.toContain(field);
    expect(columns).toContain('prompt_data');
  });
});

describe('Melbourne-day streak display', () => {
  it.each([
    ['2026-10-28', 3], ['2026-10-27', 3], ['2026-10-26', 0], [null, 0],
  ])('last solve %s produces current streak %i', async (last, expected) => {
    const { admin } = fixture([], { xp: 180, challenge_streak: 3, best_streak: 7, last_challenge: last });
    expect(await loadStreak(admin, 'learner', '2026-10-28')).toEqual({ current: expected, best: 7, xp: 180, lastSolved: last });
  });
  it('handles a missing profile without inventing rewards', async () => {
    expect(await loadStreak(fixture([]).admin, 'learner', '2026-10-28')).toEqual({ current: 0, best: 0, xp: 0, lastSolved: null });
  });
  it.each([['2024-03-01', '2024-02-29'], ['2026-03-01', '2026-02-28'], ['2026-01-01', '2025-12-31']])(
    'finds the previous calendar day before %s', (date, expected) => expect(previousDate(date)).toBe(expected));
});
