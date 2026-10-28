import { expect, type Page } from '@playwright/test';
import { mockTurnstile } from './mocks';
import type { AttemptSummary, PublicChallenge, StatusResponse, TodayResponse } from '../lib/daily-challenge/types';

// The browser renders real Next.js pages. This per-test fixture simulates
// challenge HTTP APIs, grading and persistence; it is not a live backend.
export async function dailyFixture(page: Page, circuit = false) {
  const challenge: PublicChallenge = {
    id: '33333333-3333-4333-8333-333333333333', date: '2026-10-28', difficulty: circuit ? 3 : 1,
    type: circuit ? 'gate_simplification' : 'sifting', input_kind: circuit ? 'circuit' : 'bits',
    title: circuit ? 'Two gates, same transformation' : 'A daily sifting check',
    scenario: 'Alice and Bob compare their work.', task: circuit ? 'Build the fewest-gate equivalent circuit.' : 'Submit the sifted bits.',
    options: [], prompt_data: circuit ? { task: 'simplify_circuit', num_qubits: 2,
      circuit: ['h 0', 'h 1', 'cx 0 1', 'h 0', 'h 1', 'x 1'], original_gate_count: 6,
      palette: ['h 0', 'x 0', 'x 1', 'cx 1 0'] } : { task: 'sift_key', rounds: [] },
  };
  const attempts: AttemptSummary[] = [];
  const state = { generationUnavailable: false, gradingFailures: 0, hintFailures: 0, submissions: 0, revealed: 0 };
  const hints = ['Compare the bases.', 'Keep matching rows.', 'Keep their original order.'];
  const solution = circuit ? 'CNOT(1 to 0), then X on q1: two gates.' : 'The sifted key is 101.';
  const solved = () => attempts.some(attempt => attempt.correct);
  const today = (): TodayResponse => ({ challenge, progress: {
    attemptsUsed: attempts.length, attemptsLeft: solved() ? 0 : 3 - attempts.length, maxAttempts: 3,
    solved: solved(), hints: hints.slice(0, state.revealed), hintsTotal: 3, lastAttempt: attempts.at(-1) ?? null,
    workedSolution: solved() || attempts.length === 3 ? solution : null,
  } });
  const status = (): StatusResponse => ({ date: challenge.date, completedToday: solved(),
    streak: { current: solved() ? 1 : 0, best: solved() ? 1 : 0, xp: solved() ? 100 + (attempts.at(-1)?.xpAwarded ?? 0) : 100, lastSolved: solved() ? challenge.date : null },
    tiers: ([1, 2, 3] as const).map(difficulty => ({ difficulty, started: difficulty === challenge.difficulty,
      solved: difficulty === challenge.difficulty && solved(), attemptsUsed: difficulty === challenge.difficulty ? attempts.length : 0,
      attemptsLeft: difficulty === challenge.difficulty ? today().progress.attemptsLeft : 3,
      title: difficulty === challenge.difficulty ? challenge.title : null,
      type: difficulty === challenge.difficulty ? challenge.type : null })) });
  await page.route('**/api/challenge/**', async route => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname.endsWith('/status')) return route.fulfill({ json: status() });
    if (pathname.endsWith('/today')) {
      if (state.generationUnavailable) return route.fulfill({ status: 503, json: { error: 'Challenge service unavailable' } });
      return route.fulfill({ json: today() });
    }
    if (pathname.endsWith('/hint')) {
      if (state.hintFailures > 0) { state.hintFailures--; return route.fulfill({ status: 503, json: { error: 'Hint could not be saved' } }); }
      expect(route.request().postDataJSON()).toEqual({ challengeId: challenge.id, index: state.revealed });
      state.revealed++;
      return route.fulfill({ json: { hints: hints.slice(0, state.revealed), hintsTotal: 3 } });
    }
    if (pathname.endsWith('/submit')) {
      state.submissions++;
      if (state.gradingFailures > 0) { state.gradingFailures--; return route.fulfill({ status: 503, json: { error: 'Grading unavailable, try again shortly' } }); }
      const submission = route.request().postDataJSON().submission;
      const correct = circuit && JSON.stringify(submission) === JSON.stringify({ circuit: ['cx 1 0', 'x 1'] });
      attempts.push({ attemptNo: attempts.length + 1, correct, feedback: correct ? 'Correct: the circuits match.' : 'Not quite. Try again.',
        xpAwarded: correct ? 150 : null, createdAt: '2026-10-28T00:00:00Z' });
      return route.fulfill({ json: { correct, feedback: attempts.at(-1)!.feedback, attemptsUsed: attempts.length,
        attemptsLeft: today().progress.attemptsLeft, workedSolution: today().progress.workedSolution,
        xpAwarded: attempts.at(-1)!.xpAwarded, streak: correct ? status().streak : null } });
    }
    throw Error(`Unexpected challenge API path ${pathname}`);
  });
  return { challenge, attempts, state, hints, solution };
}

export async function loginToDaily(page: Page, path = '/daily-challenge/1') {
  await mockTurnstile(page);
  await page.goto(`/login?next=${encodeURIComponent(path)}`);
  await page.getByLabel('Email address').fill('onboarded-user@e2e.test');
  await page.getByLabel('Password').fill('correct-password');
  await expect(page.getByRole('button', { name: 'Log in' })).toBeEnabled();
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(path, { timeout: 20_000 });
}
