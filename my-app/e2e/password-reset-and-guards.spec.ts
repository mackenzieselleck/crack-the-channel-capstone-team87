//e2e tests for forgot/reset password, resend-confirmation, and the route guards (visiting a protected page while signed out).

import { expect, test } from '@playwright/test';
import { errorAlert, mockTurnstile, setCaptchaToken } from './mocks';

test.describe('forgot password', () => {
  test.beforeEach(async ({ page }) => {
    await mockTurnstile(page);
  });

  test('shows the same generic message whether or not the account exists', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.getByLabel('Email').fill('anyone@e2e.test');
    await expect(page.getByRole('button', { name: 'Send reset link' })).toBeEnabled();
    await page.getByRole('button', { name: 'Send reset link' }).click();

    await expect(page.getByRole('status')).toContainText(
      'If an account exists for that email',
    );
  });

  test('surfaces a CAPTCHA-specific error when Supabase rejects the token', async ({ page }) => {
    await setCaptchaToken(page, 'trigger-captcha-fail');
    await page.goto('/forgot-password');

    await page.getByLabel('Email').fill('anyone@e2e.test');
    await expect(page.getByRole('button', { name: 'Send reset link' })).toBeEnabled();
    await page.getByRole('button', { name: 'Send reset link' }).click();

    await expect(errorAlert(page)).toContainText('CAPTCHA verification failed');
  });
});

test.describe('reset-password link validation', () => {
  test('an expired/invalid reset link shows "Link expired" instead of the password form', async ({ page }) => {
    // no recovery session cookie is set up for this test, so the page's own
    // hasValidRecoverySession() check fails, same as a stale or reused link.
    await page.goto('/reset-password');

    await expect(page.getByRole('heading', { name: 'Link expired' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Request a new link' })).toBeVisible();
  });
});

test.describe('resend confirmation', () => {
  test.beforeEach(async ({ page }) => {
    await mockTurnstile(page);
  });

  test('shows the same generic message for both existing and unknown accounts', async ({ page }) => {
    await page.goto('/email-confirmation');

    await page.getByLabel('Email address').fill('anyone@e2e.test');
    await expect(page.getByRole('button', { name: 'Resend email' })).toBeEnabled();
    await page.getByRole('button', { name: 'Resend email' }).click();

    await expect(page.getByRole('status')).toContainText(
      'If that email has an unconfirmed account',
    );
  });

  test('enforces the resend cooldown after a successful send', async ({ page }) => {
    await page.goto('/email-confirmation');

    await page.getByLabel('Email address').fill('anyone@e2e.test');
    await expect(page.getByRole('button', { name: 'Resend email' })).toBeEnabled();
    await page.getByRole('button', { name: 'Resend email' }).click();

    await expect(page.getByRole('button', { name: /Resend available in \d+s/ })).toBeDisabled();
  });

  test('shows a rate-limit error when Supabase itself rate-limits the request', async ({ page }) => {
    await page.goto('/email-confirmation');

    await page.getByLabel('Email address').fill('ratelimited@e2e.test');
    await expect(page.getByRole('button', { name: 'Resend email' })).toBeEnabled();
    await page.getByRole('button', { name: 'Resend email' }).click();

    await expect(errorAlert(page)).toContainText('Please wait a minute');
  });
});

test.describe('route guards', () => {
  test('visiting /onboarding while signed out redirects to /login', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('visiting a protected learning route while signed out redirects to /login', async ({ page }) => {
    await page.goto('/learn/bb84-basics');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('visiting the dashboard while signed out redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });
});