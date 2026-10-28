import { expect, test } from '@playwright/test';
import { dailyFixture, loginToDaily } from './dailyChallengeFixture';

test('three wrong answers close the tier and reveal the saved solution after refresh', async ({ page }) => {
  test.setTimeout(90_000);
  const fixture = await dailyFixture(page); await loginToDaily(page);
  await expect(page.getByRole('heading', { name: fixture.challenge.title })).toBeVisible({ timeout: 20_000 });
  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.getByLabel('Your bits').fill('000');
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page).toHaveURL('/daily-challenge/1/result', { timeout: 20_000 });
    if (attempt < 3) {
      await expect(page.getByText(fixture.solution, { exact: true })).toHaveCount(0);
      await page.getByRole('link', { name: 'Try again', exact: true }).click();
      await expect(page.getByLabel('Your bits')).toBeVisible({ timeout: 20_000 });
    }
  }
  await expect(page.getByRole('status').filter({ hasText: /^Out of attempts$/ })).toBeVisible();
  await expect(page.getByText(fixture.solution, { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try again', exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('status').filter({ hasText: /^Out of attempts$/ })).toBeVisible({ timeout: 20_000 });
  expect(fixture.attempts).toHaveLength(3);
  expect(fixture.attempts.every(attempt => attempt.xpAwarded === null)).toBe(true);
});

test('generation, hint and grading outages remain retryable without spending an attempt', async ({ page }) => {
  test.setTimeout(90_000);
  const fixture = await dailyFixture(page);
  fixture.state.generationUnavailable = true; fixture.state.hintFailures = 1; fixture.state.gradingFailures = 1;
  await loginToDaily(page);
  await expect(page.getByRole('alert').filter({ hasText: 'Challenge service unavailable' })).toBeVisible({ timeout: 20_000 });
  fixture.state.generationUnavailable = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('heading', { name: fixture.challenge.title })).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: /Reveal hint 1/ }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Hint could not be saved' })).toBeVisible();
  expect(fixture.state.revealed).toBe(0);
  await page.getByRole('button', { name: /Reveal hint 1/ }).click();
  await expect(page.getByText(fixture.hints[0], { exact: true })).toBeVisible();
  await page.getByLabel('Your bits').fill('000');
  await page.getByRole('button', { name: 'Submit answer' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Grading unavailable' })).toBeVisible();
  expect(fixture.attempts).toHaveLength(0);
  await expect(page.getByText('3 of 3 left.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Submit answer' }).click();
  await expect(page).toHaveURL('/daily-challenge/1/result', { timeout: 20_000 });
  expect(fixture.attempts).toHaveLength(1);
  expect(fixture.state.submissions).toBe(2);
});

test('signed-out access redirects and an invalid tier renders a controlled error', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/daily-challenge/1');
  await expect(page).toHaveURL(/\/login(?:\?|$)/, { timeout: 20_000 });
  await dailyFixture(page); await loginToDaily(page, '/daily-challenge/4');
  await expect(page.getByRole('alert').filter({ hasText: 'Challenge not found' })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('button', { name: 'Submit answer' })).toHaveCount(0);
});

test('the circuit builder submits the two-gate fixture and shows a successful result', async ({ page }) => {
  test.setTimeout(90_000);
  const fixture = await dailyFixture(page, true); await loginToDaily(page, '/daily-challenge/3');
  await expect(page.getByRole('heading', { name: fixture.challenge.title })).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: 'CNOT 1→0', exact: true }).click();
  await page.getByRole('button', { name: 'Add X on q1', exact: true }).click();
  await page.getByRole('button', { name: 'Submit answer' }).click();
  await expect(page).toHaveURL('/daily-challenge/3/result', { timeout: 20_000 });
  await expect(page.getByRole('status').filter({ hasText: /^Correct!$/ })).toBeVisible();
  await expect(page.getByText('+150 XP', { exact: true })).toBeVisible();
  expect(fixture.attempts[0].correct).toBe(true);
});
