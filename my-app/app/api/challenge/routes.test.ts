import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(), limitRoute: vi.fn(), llmAllowed: vi.fn(),
  writeFeedback: vi.fn(), qiskit: vi.fn(), rpc: vi.fn(),
  admin: {} as Record<string, unknown>,
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: mocks.getUser } }),
  createAdminClient: () => mocks.admin,
  melbourneDate: () => '2026-10-28', MAX_ATTEMPTS: 3, MODULE_MCQ: 'module_mcq',
  qiskit: mocks.qiskit,
  seededRandom: () => () => 0.42,
}));
vi.mock('@/lib/daily-challenge/rateLimit', () => ({
  limitRoute: mocks.limitRoute, llmAllowed: mocks.llmAllowed,
}));
vi.mock('@/lib/daily-challenge/prompts', () => ({
  writeFeedback: mocks.writeFeedback, writeModuleMcq: vi.fn(),
}));

import { POST as hint } from './hint/route';
import { GET as status } from './status/route';
import { POST as submit } from './submit/route';

type Row = Record<string, unknown>;
type QueryRecord = { table: string; action: string; filters: [string, unknown][]; value: Row; columns: string };
const id = '11111111-1111-4111-8111-111111111111';
const otherId = '22222222-2222-4222-8222-222222222222';
const hints = ['Compare the bases.', 'Keep matching rows.', 'Start with the first row.'];
let challenges: Row[];
let attempts: Row[];
let secret: Row | null;
let profile: Row | null;
let insertError: Row | null;
let queries: QueryRecord[];
let hintSaveError: boolean;
let hintUpdateMiss: boolean;
let hintReadError: boolean;

function databaseFixture() {
  return {
    rpc: mocks.rpc,
    from(table: string) {
      const record: QueryRecord = { table, action: 'select', filters: [], value: {}, columns: '' };
      queries.push(record);
      const matches = (row: Row) => record.filters.every(([key, expected]) =>
        Array.isArray(expected) ? expected.includes(row[key]) : row[key] === expected);
      function execute(single: boolean) {
        if (table === 'daily_challenges' && record.action === 'select' && hintReadError) {
          return { data: null, error: { code: 'offline' } };
        }
        if (table === 'daily_challenges' && record.action === 'update') {
          if (hintSaveError) return { data: null, error: { code: 'offline' } };
          if (hintUpdateMiss) return { data: null, error: null };
        }
        let rows = table === 'daily_challenges' ? challenges
          : table === 'challenge_attempts' ? attempts
          : table === 'daily_challenge_answers' ? (secret ? [secret] : [])
          : table === 'profiles' ? (profile ? [profile] : []) : [];
        if (record.action === 'insert') {
          if (insertError) return { data: null, error: insertError };
          const inserted = { id: `attempt-${attempts.length + 1}`, ...record.value };
          attempts.push(inserted);
          return { data: single ? inserted : [inserted], error: null };
        }
        rows = rows.filter(matches);
        if (record.action === 'update') rows.forEach(row => Object.assign(row, record.value));
        return { data: single ? rows[0] ?? null : rows, error: null };
      }
      const query = {
        select(columns: string) { record.columns = columns; return this; },
        eq(key: string, value: unknown) { record.filters.push([key, value]); return this; },
        in(key: string, values: unknown[]) { record.filters.push([key, values]); return this; },
        update(value: Row) { record.action = 'update'; record.value = value; return this; },
        insert(value: Row) { record.action = 'insert'; record.value = value; return this; },
        single: async () => execute(true), maybeSingle: async () => execute(true),
        then(resolve: (value: ReturnType<typeof execute>) => unknown) { return Promise.resolve(execute(false)).then(resolve); },
      };
      return query;
    },
  };
}
const request = (route: string, body: unknown) => new NextRequest(`http://localhost/api/challenge/${route}`, {
  method: 'POST', body: JSON.stringify(body),
});
const hintRequest = (index = 0, challengeId = id) => request('hint', { challengeId, index });
const submitRequest = (extra: Row = {}) => request('submit', { challengeId: id, submission: { bits: '101' }, ...extra });

beforeEach(() => {
  vi.resetAllMocks();
  challenges = [{ id, user_id: 'learner', date: '2026-10-28', type: 'sifting', difficulty: 2,
    title: 'Compare the bases', hints: [...hints], hints_revealed: 0 }];
  attempts = [];
  secret = { challenge_id: id, answer: { bits: '101' }, worked_solution: 'Secret worked solution.', leak_terms: ['101'] };
  profile = { id: 'learner', xp: 165, challenge_streak: 2, best_streak: 4, last_challenge: '2026-10-28' };
  insertError = null; queries = [];
  hintSaveError = false; hintUpdateMiss = false; hintReadError = false;
  mocks.admin = databaseFixture();
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'learner' } } });
  mocks.limitRoute.mockResolvedValue(null);
  mocks.llmAllowed.mockResolvedValue(false);
  mocks.qiskit.mockResolvedValue({ correct: false, mistake_tag: 'wrong_key', explanation: 'Compare the matching bases.' });
  mocks.writeFeedback.mockImplementation(async (args: { explanation: string }) => args.explanation);
  mocks.rpc.mockResolvedValue({ data: { xpAwarded: 65 }, error: null });
});
afterEach(() => vi.restoreAllMocks());

describe('Daily Challenge route access guards', () => {
  it.each(['hint', 'status', 'submit'])('%s refuses anonymous requests before database access', async (route) => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const response = route === 'hint' ? await hint(hintRequest()) : route === 'status' ? await status() : await submit(submitRequest());
    expect(response.status).toBe(401);
    expect(queries).toEqual([]);
    expect(mocks.limitRoute).not.toHaveBeenCalled();
  });

  it.each(['hint', 'status', 'submit'])('%s forwards its rate-limit response', async (route) => {
    mocks.limitRoute.mockResolvedValue(NextResponse.json({ error: 'rate limited' }, { status: 429, headers: { 'Retry-After': '30' } }));
    const response = route === 'hint' ? await hint(hintRequest()) : route === 'status' ? await status() : await submit(submitRequest());
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('30');
    expect(mocks.limitRoute).toHaveBeenCalledWith('learner', route);
    expect(queries).toEqual([]);
  });
});

describe('hint route', () => {
  it('withholds a hint when the save fails and permits a later retry', async () => {
    hintSaveError = true;
    const failed = await hint(hintRequest());
    expect(failed.status).toBe(503);
    expect(await failed.json()).not.toHaveProperty('hints');
    expect(challenges[0].hints_revealed).toBe(0);
    hintSaveError = false;
    const retried = await hint(hintRequest());
    expect(retried.status).toBe(200);
    expect(await retried.json()).toEqual({ hints: [hints[0]], hintsTotal: 3 });
    expect(challenges[0].hints_revealed).toBe(1);
  });
  it('reports a read outage instead of calling it a missing challenge', async () => {
    hintReadError = true;
    expect((await hint(hintRequest())).status).toBe(503);
    expect(queries.some(query => query.action === 'update')).toBe(false);
  });
  it('does not assume a hint was saved when a conditional update returns no row', async () => {
    hintUpdateMiss = true;
    const response = await hint(hintRequest());
    expect(response.status).toBe(409);
    expect(await response.json()).not.toHaveProperty('hints');
    expect(challenges[0].hints_revealed).toBe(0);
  });
  it('reads persisted progress after another request wins the conditional update', async () => {
    // A deterministic conflict fixture, not independent-connection concurrency.
    const originalFrom = mocks.admin.from as (table: string) => unknown;
    mocks.admin.from = (table: string) => {
      const query = originalFrom(table) as { update: (value: Row) => unknown };
      const originalUpdate = query.update;
      query.update = function(value: Row) {
        challenges[0].hints_revealed = 1;
        hintUpdateMiss = true;
        return originalUpdate.call(this, value);
      };
      return query;
    };
    const response = await hint(hintRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ hints: [hints[0]], hintsTotal: 3 });
    expect(challenges[0].hints_revealed).toBe(1);
  });
  it.each([{ challengeId: 'bad-id', index: 0 }, { challengeId: id, index: -1 }, { challengeId: id, index: 3 }, { challengeId: id, index: 0.5 }])('rejects invalid hint payload %j', async (body) => {
    expect((await hint(request('hint', body))).status).toBe(400);
    expect(queries).toEqual([]);
  });

  it('rejects malformed JSON', async () => {
    expect((await hint(new NextRequest('http://localhost/api/challenge/hint', { method: 'POST', body: '{broken' }))).status).toBe(400);
  });

  it('does not reveal a challenge belonging to another learner', async () => {
    challenges[0].user_id = 'other-learner';
    expect((await hint(hintRequest())).status).toBe(404);
    expect(queries[0].filters).toContainEqual(['user_id', 'learner']);
    expect(queries.some(query => query.action === 'update')).toBe(false);
  });

  it('rejects an unknown challenge', async () => {
    expect((await hint(hintRequest(0, otherId))).status).toBe(404);
  });

  it('requires earlier hints before later ones', async () => {
    const response = await hint(hintRequest(1));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Reveal the earlier hints first.' });
    expect(challenges[0].hints_revealed).toBe(0);
  });

  it('reveals hints sequentially without exposing unrevealed hints', async () => {
    for (let index = 0; index < 3; index++) {
      const response = await hint(hintRequest(index));
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ hints: hints.slice(0, index + 1), hintsTotal: 3 });
    }
    expect(challenges[0].hints_revealed).toBe(3);
    const updates = queries.filter(query => query.action === 'update');
    expect(updates.map(query => query.filters)).toEqual([0, 1, 2].map(index => [
      ['id', id], ['user_id', 'learner'], ['hints_revealed', index],
    ]));
  });

  it('does not charge a previously revealed hint again', async () => {
    await hint(hintRequest());
    const repeated = await hint(hintRequest());
    expect(await repeated.json()).toEqual({ hints: [hints[0]], hintsTotal: 3 });
    expect(queries.filter(query => query.action === 'update')).toHaveLength(1);
    expect(challenges[0].hints_revealed).toBe(1);
  });

  it('rejects a valid index when no corresponding hint exists', async () => {
    challenges[0].hints = [];
    expect((await hint(hintRequest())).status).toBe(400);
  });
});

describe('status route', () => {
  it('summarises started, solved and untouched tiers with private cache headers', async () => {
    challenges.push({ id: otherId, user_id: 'learner', date: '2026-10-28', difficulty: 1, title: 'Tier one', type: 'module_mcq' });
    attempts.push({ user_id: 'learner', challenge_id: id, correct: false },
      { user_id: 'learner', challenge_id: id, correct: true },
      { user_id: 'learner', challenge_id: otherId, correct: false });
    const response = await status();
    const body = await response.json();
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(body).toMatchObject({ date: '2026-10-28', completedToday: true,
      tiers: [
        { difficulty: 1, started: true, solved: false, attemptsUsed: 1, attemptsLeft: 2 },
        { difficulty: 2, started: true, solved: true, attemptsUsed: 2, attemptsLeft: 0 },
        { difficulty: 3, started: false, solved: false, attemptsUsed: 0, attemptsLeft: 3, title: null, type: null },
      ], streak: { current: 2, best: 4, xp: 165, lastSolved: '2026-10-28' } });
    expect(queries.find(query => query.table === 'daily_challenges')?.filters).toEqual([['user_id', 'learner'], ['date', '2026-10-28']]);
    expect(queries.find(query => query.table === 'challenge_attempts')?.filters).toContainEqual(['user_id', 'learner']);
  });

  it('shows empty tiers without fetching attempts when no challenges exist', async () => {
    challenges = [];
    const body = await (await status()).json();
    expect(body.completedToday).toBe(false);
    expect(body.tiers).toHaveLength(3);
    expect(body.tiers.every((tier: { started: boolean; attemptsLeft: number }) => !tier.started && tier.attemptsLeft === 3)).toBe(true);
    expect(queries.some(query => query.table === 'challenge_attempts')).toBe(false);
  });

  it('does not include another learner or previous-day challenge', async () => {
    challenges.push({ id: otherId, user_id: 'other', date: '2026-10-28', difficulty: 3 },
      { id: 'old', user_id: 'learner', date: '2026-10-27', difficulty: 1 });
    const body = await (await status()).json();
    expect(body.tiers.filter((tier: { started: boolean }) => tier.started)).toHaveLength(1);
    expect(body.tiers[1].difficulty).toBe(2);
  });

  it('shows no remaining attempts for an exhausted unsolved tier', async () => {
    attempts = Array.from({ length: 3 }, () => ({ user_id: 'learner', challenge_id: id, correct: false }));
    const body = await (await status()).json();
    expect(body.completedToday).toBe(false);
    expect(body.tiers[1]).toMatchObject({ attemptsUsed: 3, attemptsLeft: 0, solved: false });
  });

  it('resets a stale current streak while retaining best streak and XP', async () => {
    profile!.last_challenge = '2026-10-25';
    const body = await (await status()).json();
    expect(body.streak).toMatchObject({ current: 0, best: 4, xp: 165 });
  });
});

describe('submission route', () => {
  it.each([
    { challengeId: 'bad-id', submission: { bits: '101' } },
    { challengeId: id, submission: { bits: '102' } },
    { challengeId: id, submission: { rate_pct: 101 } },
    { challengeId: id, submission: {} },
  ])('rejects invalid submission %j before database access', async (body) => {
    expect((await submit(request('submit', body))).status).toBe(400);
    expect(queries).toEqual([]);
  });

  it('rejects malformed JSON', async () => {
    expect((await submit(new NextRequest('http://localhost/api/challenge/submit', { method: 'POST', body: '{broken' }))).status).toBe(400);
  });

  it('rejects another learner\'s challenge before reading its answer', async () => {
    challenges[0].user_id = 'other';
    expect((await submit(submitRequest())).status).toBe(404);
    expect(queries[0].filters).toContainEqual(['user_id', 'learner']);
    expect(queries.some(query => query.table === 'daily_challenge_answers')).toBe(false);
  });

  it('rejects yesterday\'s challenge without consuming an attempt', async () => {
    challenges[0].date = '2026-10-27';
    expect((await submit(submitRequest())).status).toBe(410);
    expect(attempts).toEqual([]);
    expect(mocks.qiskit).not.toHaveBeenCalled();
  });

  it('rejects a solved challenge before another grade or reward', async () => {
    attempts.push({ user_id: 'learner', challenge_id: id, correct: true });
    expect((await submit(submitRequest())).status).toBe(409);
    expect(mocks.qiskit).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('rejects a fourth attempt', async () => {
    attempts = Array.from({ length: 3 }, () => ({ user_id: 'learner', challenge_id: id, correct: false }));
    expect((await submit(submitRequest())).status).toBe(429);
    expect(attempts).toHaveLength(3);
    expect(mocks.qiskit).not.toHaveBeenCalled();
  });

  it('returns a server error when the secret answer is missing', async () => {
    secret = null;
    expect((await submit(submitRequest())).status).toBe(500);
    expect(mocks.qiskit).not.toHaveBeenCalled();
  });

  it('does not consume an attempt when grading is unavailable', async () => {
    mocks.qiskit.mockRejectedValue(new Error('service unavailable'));
    expect((await submit(submitRequest())).status).toBe(503);
    expect(attempts).toEqual([]);
    expect(mocks.writeFeedback).not.toHaveBeenCalled();
  });

  it('records an incorrect attempt without exposing the answer or awarding XP', async () => {
    const response = await submit(submitRequest());
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toMatchObject({ correct: false, attemptsUsed: 1, attemptsLeft: 2, xpAwarded: null, workedSolution: null, streak: null });
    expect(JSON.stringify(body)).not.toContain('Secret worked solution');
    expect(attempts[0]).toMatchObject({ user_id: 'learner', challenge_id: id, attempt_no: 1, correct: false });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('reveals the worked solution after the final failed attempt', async () => {
    attempts = Array.from({ length: 2 }, () => ({ user_id: 'learner', challenge_id: id, correct: false }));
    const body = await (await submit(submitRequest())).json();
    expect(body).toMatchObject({ correct: false, attemptsUsed: 3, attemptsLeft: 0, workedSolution: 'Secret worked solution.' });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('awards a correct answer using server hint usage and stores the returned reward', async () => {
    challenges[0].hints_revealed = 2;
    attempts.push({ user_id: 'learner', challenge_id: id, correct: false });
    mocks.qiskit.mockResolvedValue({ correct: true, mistake_tag: null, explanation: 'Correct: the sifted key matches.' });
    const response = await submit(submitRequest({ hintsUsed: 0 }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith('record_daily_solve', { p_user_id: 'learner', p_tier: 2, p_hints_used: 2, p_attempt: 2 });
    expect(attempts[1]).toMatchObject({ correct: true, hints_used: 2, xp_awarded: 65, attempt_no: 2 });
    expect(body).toMatchObject({ correct: true, attemptsLeft: 0, xpAwarded: 65, workedSolution: 'Secret worked solution.', streak: { current: 2, best: 4, xp: 165 } });
  });

  it('grades a module question locally without calling Qiskit', async () => {
    challenges[0].type = 'module_mcq';
    secret!.answer = { correct_option: 'b' };
    const body = await (await submit(submitRequest({ submission: { option_id: 'b' } }))).json();
    expect(body.correct).toBe(true);
    expect(mocks.qiskit).not.toHaveBeenCalled();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });

  it('returns conflict rather than awarding a reward when attempt insert races', async () => {
    mocks.qiskit.mockResolvedValue({ correct: true, mistake_tag: null, explanation: 'Correct answer.' });
    insertError = { code: '23505' };
    expect((await submit(submitRequest())).status).toBe(409);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
