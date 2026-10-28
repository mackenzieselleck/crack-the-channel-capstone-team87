import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  getUser: vi.fn(),
  qiskit: vi.fn(),
  admin: {} as Record<string, unknown>,
  categorySeed: 0,
}));

vi.mock('openai', () => ({
  default: class {
    static APIError = class extends Error {};
    chat = { completions: { create: mocks.create } };
  },
}));
vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => mocks.admin,
  createClient: async () => ({ auth: { getUser: mocks.getUser } }),
  qiskit: mocks.qiskit,
  seedFrom: () => mocks.categorySeed,
  seededRandom: () => () => 0.42,
  melbourneDate: () => '2026-10-27',
  MODULE_MCQ: 'module_mcq',
  PYTHON_TYPES: ['sifting'],
  MAX_ATTEMPTS: 3,
}));

import { GET } from './today/route';
import { POST } from './submit/route';
import { FALLBACK_TEXT } from '@/lib/daily-challenge/prompts';

type Row = Record<string, unknown>;
const challengeId = '11111111-1111-4111-8111-111111111111';
const goodText = {
  title: 'Compare the bases',
  scenario: 'Alice and Bob compare the bases shown in the table.',
  task: 'Submit the requested sifted key.',
  hints: ['Look for matching bases.', 'Keep matching rows in their original order.', 'Compare the bases in the first row.'],
};
const mcq = {
  question: 'Which unit stores quantum information?',
  options: ['Qubit', 'Router', 'Packet', 'Password'],
  correct_index: 0,
  supporting_quote: 'A qubit stores quantum information.',
  explanation: 'The passage describes the qubit as the unit that stores quantum information.',
};
const sourcePassage = 'A qubit stores quantum information. Alice sends prepared qubits to Bob. '.repeat(5);
const challenge = {
  type: 'sifting', difficulty: 1, seed: 0, input_kind: 'bits',
  prompt_data: { task: 'sift_key', rounds: [{ basis: 'Z' }] }, options: [],
  answer: { secret: 'SECRET_ANSWER' }, worked_solution: 'SECRET_WORKED_SOLUTION', leak_terms: ['101101'],
};

let now: number;
let stored: Row | null;
let secret: Row | null;
let recordedAttempt: Row | null;
let budgetOutage: boolean;
let budgetDelayMs: number;

function databaseFixture() {
  return {
    rpc: vi.fn(async (_name: string, args: { p_key?: string }) => {
      if (args.p_key?.startsWith('llm:')) {
        now += budgetDelayMs;
        budgetDelayMs = 0;
      }
      return budgetOutage && args.p_key?.startsWith('llm:')
        ? { data: null, error: { message: 'budget database unavailable' } }
        : { data: [{ allowed: true, retry_after: 0 }], error: null };
    }),
    from(table: string) {
      let action = 'select';
      let value: Row = {};
      function result() {
        let data: unknown = [];
        if (table === 'module_progress') data = [{ module_id: 'module-1' }];
        if (table === 'modules') data = [{ id: 'module-1' }];
        if (table === 'module_pages') data = [{ body: sourcePassage }];
        if (table === 'quiz_questions') data = [{ prompt: mcq.question, options: mcq.options, explanation: mcq.explanation, answer_keys: { correct_index: 0 } }];
        if (table === 'daily_challenges') {
          if (action === 'upsert') stored = { id: challengeId, ...value, hints_revealed: 0 };
          data = stored;
        }
        if (table === 'daily_challenge_answers') {
          if (action === 'insert') secret = value;
          data = secret;
        }
        if (table === 'challenge_attempts' && action === 'insert') {
          recordedAttempt = value;
          data = { id: 'attempt-1' };
        }
        return { data, error: null };
      }
      const query = {
        select() { return this; }, eq() { return this; }, in() { return this; }, order() { return this; },
        upsert(row: Row) { action = 'upsert'; value = row; return this; },
        insert(row: Row) { action = 'insert'; value = row; return this; },
        maybeSingle: async () => result(), single: async () => result(),
        then(resolve: (value: ReturnType<typeof result>) => unknown) { return Promise.resolve(result()).then(resolve); },
      };
      return query;
    },
  };
}

function responses(...values: unknown[]) {
  for (const value of values) {
    mocks.create.mockResolvedValueOnce({ choices: [{ message: { content: typeof value === 'string' ? value : JSON.stringify(value) } }] });
  }
}
const today = () => GET(new NextRequest('http://localhost/api/challenge/today?difficulty=1'));
const submit = () => POST(new NextRequest('http://localhost/api/challenge/submit', {
  method: 'POST', body: JSON.stringify({ challengeId, submission: { bits: '101' } }),
}));

beforeEach(() => {
  vi.resetAllMocks();
  now = 1_000_000;
  stored = null; secret = null; recordedAttempt = null; budgetOutage = false;
  budgetDelayMs = 0;
  vi.spyOn(Date, 'now').mockImplementation(() => now);
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  mocks.categorySeed = 0;
  mocks.admin = databaseFixture();
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'learner' } } });
  mocks.qiskit.mockResolvedValue(challenge);
  mocks.create.mockRejectedValue(new Error('No configured controlled response'));
});
afterEach(() => vi.restoreAllMocks());

describe('challenge prompting route integration with simulated external services', () => {
  it('rejects an answer in the title before storage and returns only the safe retry', async () => {
    responses({ ...goodText, title: 'The key is 101101' }, goodText);
    const response = await today();
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.challenge.title).toBe(goodText.title);
    expect(stored?.title).toBe(goodText.title);
    expect(mocks.create).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(json)).not.toContain('101101');
    expect(JSON.stringify(json)).not.toContain('SECRET_ANSWER');
    expect(secret?.answer).toEqual(challenge.answer);
    expect(json.progress.hints).toEqual([]);
    expect(json.progress.workedSolution).toBeNull();
  });

  it('stores deterministic text if both generated titles leak', async () => {
    responses({ ...goodText, title: 'The key is 101101' }, { ...goodText, title: 'Enter 101101' });
    const json = await (await today()).json();
    expect(stored?.used_fallback).toBe(true);
    expect(json.challenge.title).toBe(FALLBACK_TEXT.sifting.title);
    expect(JSON.stringify(json)).not.toContain('101101');
  });

  it('still serves a challenge without model requests when the LLM budget database fails', async () => {
    budgetOutage = true;
    const response = await today();
    expect(response.status).toBe(200);
    expect(stored?.used_fallback).toBe(true);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('keeps the human module question and shuffled answer mapping on a budget outage', async () => {
    budgetOutage = true;
    mocks.categorySeed = 1;
    const json = await (await today()).json();
    expect(json.challenge.type).toBe('module_mcq');
    const answer = secret?.answer as { correct_option: string };
    const options = json.challenge.options as { id: string; display: string }[];
    expect(options.find(option => option.id === answer.correct_option)?.display).toBe('Qubit');
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('shares one deadline across MCQ retries, verification and challenge wording', async () => {
    mocks.categorySeed = 1;
    const content = ['{broken', mcq, { index: 0 }, '{broken'];
    const duration = [14_000, 14_000, 9_000, 3_000];
    mocks.create.mockImplementation(async (_body: unknown, options: { timeout: number }) => {
      const elapsed = now - 1_000_000;
      expect(options.timeout).toBeLessThanOrEqual(40_000 - elapsed);
      now += duration.shift()!;
      const next = content.shift();
      return { choices: [{ message: { content: typeof next === 'string' ? next : JSON.stringify(next) } }] };
    });
    const response = await today();
    expect(response.status).toBe(200);
    expect(mocks.create).toHaveBeenCalledTimes(4);
    expect(stored?.type).toBe('module_mcq');
    expect(stored?.used_fallback).toBe(true);
    expect(mocks.create.mock.calls.at(-1)?.[1].timeout).toBe(3_000);
  });

  it('skips all model work when earlier route work consumes the deadline', async () => {
    mocks.categorySeed = 1;
    mocks.getUser.mockImplementation(async () => {
      now += 41_000;
      return { data: { user: { id: 'learner' } } };
    });
    expect((await today()).status).toBe(200);
    expect(stored?.used_fallback).toBe(true);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('does not start model work if the budget check completes after the shared deadline', async () => {
    budgetDelayMs = 41_000;
    expect((await today()).status).toBe(200);
    expect(stored?.used_fallback).toBe(true);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('returns the cached challenge without another model call', async () => {
    stored = { id: challengeId, date: '2026-10-27', type: 'sifting', difficulty: 1, input_kind: 'bits', prompt_data: challenge.prompt_data, options: [], ...goodText, hints_revealed: 0 };
    expect((await today()).status).toBe(200);
    expect(mocks.qiskit).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('refuses anonymous generation', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    expect((await today()).status).toBe(401);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('records the authoritative feedback when grading consumes the model deadline', async () => {
    stored = { id: challengeId, date: '2026-10-27', type: 'sifting', difficulty: 1, hints_revealed: 0 };
    secret = { answer: challenge.answer, worked_solution: challenge.worked_solution, leak_terms: challenge.leak_terms };
    mocks.qiskit.mockImplementation(async () => {
      now += 41_000;
      return { correct: false, mistake_tag: 'wrong_key', explanation: 'Keep only the rows with matching bases.' };
    });
    const response = await submit();
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.feedback).toBe('Keep only the rows with matching bases.');
    expect(recordedAttempt?.feedback).toBe(json.feedback);
    expect(json.correct).toBe(false);
    expect(json.workedSolution).toBeNull();
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
