import { expect, test } from '@playwright/test';
import type {
  AttemptSummary,
  Difficulty,
  PublicChallenge,
  StatusResponse,
  SubmitResponse,
  TodayResponse,
} from '../lib/daily-challenge/types';
import { mockTurnstile } from './mocks';

// Browser journey through the real Next.js pages and login/session guard. The
// existing fake Supabase server handles authentication; these per-test routes
// simulate the Daily Challenge API, grading and saved progress. This is not
// evidence of live Qiskit/LLM/Supabase reward integration.
test('Daily Challenge supports a hint, failed attempt, successful retry and refresh', async ({ page }) => {
  const challenge: PublicChallenge = {
    id: '11111111-1111-4111-8111-111111111111',
    date: '2026-10-28',
    type: 'module_mcq',
    difficulty: 1,
    input_kind: 'multiple_choice',
    prompt_data: { task: 'module_question', question: 'Which unit stores quantum information?' },
    options: [
      { id: 'a', display: 'Router' },
      { id: 'b', display: 'Qubit' },
      { id: 'c', display: 'Packet' },
      { id: 'd', display: 'Cable' },
    ],
    title: 'A quantum information check',
    scenario: 'Alice and Bob review a concept from their completed module.',
    task: 'Choose the unit that stores quantum information.',
  };
  const hints = [
    'Think about the term used for quantum information.',
    'Compare each option with the wording in the module.',
    'Rule out ordinary networking equipment.',
  ];
  const workedSolution = 'A qubit is the unit used to store quantum information.';
  const attempts: AttemptSummary[] = [];
  let hintsRevealed = 0;
  let started = false;
  let hintRequests = 0;
  const submissions: unknown[] = [];

  const solved = () => attempts.some(attempt => attempt.correct);
  const streak = () => ({
    current: solved() ? 1 : 0,
    best: solved() ? 1 : 0,
    xp: solved() ? 125 : 100,
    lastSolved: solved() ? challenge.date : null,
  });
  const today = (): TodayResponse => ({
    challenge,
    progress: {
      attemptsUsed: attempts.length,
      attemptsLeft: solved() ? 0 : 3 - attempts.length,
      maxAttempts: 3,
      solved: solved(),
      hints: hints.slice(0, hintsRevealed),
      hintsTotal: hints.length,
      lastAttempt: attempts.at(-1) ?? null,
      workedSolution: solved() || attempts.length === 3 ? workedSolution : null,
    },
  });
  const status = (): StatusResponse => ({
    date: challenge.date,
    completedToday: solved(),
    streak: streak(),
    tiers: ([1, 2, 3] as Difficulty[]).map(difficulty => ({
      difficulty,
      started: difficulty === 1 && started,
      solved: difficulty === 1 && solved(),
      attemptsUsed: difficulty === 1 ? attempts.length : 0,
      attemptsLeft: difficulty === 1 ? today().progress.attemptsLeft : 3,
      title: difficulty === 1 && started ? challenge.title : null,
      type: difficulty === 1 && started ? challenge.type : null,
    })),
  });

  await page.route('**/api/challenge/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === '/api/challenge/status' && request.method() === 'GET') {
      await route.fulfill({ json: status() });
    } else if (url.pathname === '/api/challenge/today' && request.method() === 'GET') {
      expect(url.searchParams.get('difficulty')).toBe('1');
      started = true;
      await route.fulfill({ json: today() });
    } else if (url.pathname === '/api/challenge/hint' && request.method() === 'POST') {
      expect(request.postDataJSON()).toEqual({ challengeId: challenge.id, index: hintsRevealed });
      hintsRevealed++;
      hintRequests++;
      await route.fulfill({ json: { hints: hints.slice(0, hintsRevealed), hintsTotal: hints.length } });
    } else if (url.pathname === '/api/challenge/submit' && request.method() === 'POST') {
      const body = request.postDataJSON() as { challengeId: string; submission: { option_id: string } };
      expect(body.challengeId).toBe(challenge.id);
      submissions.push(body.submission);
      const correct = body.submission.option_id === 'b';
      const attempt: AttemptSummary = {
        attemptNo: attempts.length + 1,
        correct,
        feedback: correct ? 'Correct: a qubit stores quantum information.' : 'Not quite. Review the module wording and try another option.',
        xpAwarded: correct ? 25 : null,
        createdAt: '2026-10-28T00:00:00Z',
      };
      attempts.push(attempt);
      const response: SubmitResponse = {
        correct,
        feedback: attempt.feedback!,
        attemptsUsed: attempts.length,
        attemptsLeft: correct ? 0 : 3 - attempts.length,
        workedSolution: correct ? workedSolution : null,
        xpAwarded: attempt.xpAwarded,
        streak: correct ? streak() : null,
      };
      await route.fulfill({ json: response });
    } else {
      throw new Error(`Unexpected challenge request: ${request.method()} ${url.pathname}`);
    }
  });
  await mockTurnstile(page);
  await page.goto('/login?next=%2Fdaily-challenge');
  await page.getByLabel('Email address').fill('onboarded-user@e2e.test');
  await page.getByLabel('Password').fill('correct-password');
  await expect(page.getByRole('button', { name: 'Log in' })).toBeEnabled();
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page).toHaveURL('/daily-challenge');
  await expect(page.getByRole('heading', { name: "Today's challenges" })).toBeVisible();
  await page.locator('a[href="/daily-challenge/1"]').click();
  await expect(page.getByRole('heading', { name: challenge.title })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit answer' })).toBeDisabled();
  await expect(page.getByText(hints[0], { exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Reveal hint 1', exact: false }).click();
  await expect(page.getByText(hints[0], { exact: true })).toBeVisible();
  await expect(page.getByText('40 XP', { exact: true })).toBeVisible();
  // Radios are visually hidden inside clickable labels; use the visible label
  // rather than forcing a click through its decorative letter badge.
  await page.getByText('Router', { exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Router', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Submit answer' }).click();

  await expect(page).toHaveURL('/daily-challenge/1/result');
  await expect(page.getByRole('status').filter({ hasText: /^Not quite$/ })).toBeVisible();
  await expect(page.getByText('2 attempts left', { exact: true })).toBeVisible();
  await expect(page.getByText(workedSolution, { exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Try again', exact: true }).click();
  await expect(page).toHaveURL('/daily-challenge/1');
  await expect(page.getByText(hints[0], { exact: true })).toBeVisible();
  await expect(page.getByText('25 XP', { exact: true })).toBeVisible();
  await page.getByText('Qubit', { exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Qubit', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Submit answer' }).click();
  await expect(page).toHaveURL('/daily-challenge/1/result');
  await expect(page.getByRole('status').filter({ hasText: /^Correct!$/ })).toBeVisible();
  await expect(page.getByText('+25 XP', { exact: true })).toBeVisible();
  await expect(page.getByText(workedSolution, { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('status').filter({ hasText: /^Correct!$/ })).toBeVisible();
  await expect(page.getByText('+25 XP', { exact: true })).toBeVisible();
  await expect(page.getByText('Solved on attempt 2', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try again', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'All challenges', exact: true }).click();
  await expect(page.getByRole('heading', { name: "Today's challenges" })).toBeVisible();
  await expect(page.locator('a[href="/daily-challenge/1/result"]')).toContainText('Review');
  await expect(page.getByText('Safe for today', { exact: true })).toBeVisible();

  expect(hintRequests).toBe(1);
  expect(submissions).toEqual([{ option_id: 'a' }, { option_id: 'b' }]);
});
