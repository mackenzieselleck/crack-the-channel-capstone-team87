//e2e tests for signup and login in a real browser 

import { expect, test } from '@playwright/test';
import { errorAlert, mockTurnstile, setCaptchaToken } from './mocks';

test.describe('signup', () => {
  test.beforeEach(async ({ page }) => {
    await mockTurnstile(page);
  });

  test('creating an account takes you to the check-your-email page', async ({ page }) => {
    await page.goto('/signup');

    await page.getByLabel('Email address').fill('brand-new@e2e.test');
    await page.getByLabel('Password', { exact: true }).fill('Sup3rSecret!');
    await page.getByLabel('Confirm password').fill('Sup3rSecret!');

    // widget mock resolves asynchronously; wait for the button to unlock
    await expect(page.getByRole('button', { name: 'Create account' })).toBeEnabled();
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL(/\/email-confirmation$/);
    await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
  });

  test('shows a client-side error when the two password fields do not match', async ({ page }) => {
    await page.goto('/signup');

    await page.getByLabel('Email address').fill('brand-new@e2e.test');
    await page.getByLabel('Password', { exact: true }).fill('Sup3rSecret!');
    await page.getByLabel('Confirm password').fill('SomethingDifferent1!');

    await expect(page.getByRole('button', { name: 'Create account' })).toBeEnabled();
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(errorAlert(page)).toHaveText('Passwords do not match');
    // still on the signup page - never reached Supabase
    await expect(page).toHaveURL(/\/signup$/);
  });

  test('surfaces a generic error when the account already exists', async ({ page }) => {
    await page.goto('/signup');

    await page.getByLabel('Email address').fill('existing@e2e.test');
    await page.getByLabel('Password', { exact: true }).fill('Sup3rSecret!');
    await page.getByLabel('Confirm password').fill('Sup3rSecret!');

    await expect(page.getByRole('button', { name: 'Create account' })).toBeEnabled();
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(errorAlert(page)).toHaveText(
      'User already exists. Please try logging in instead.'
    );
  });
});

test.describe('login', () => {
  test.beforeEach(async ({ page }) => {
    await mockTurnstile(page);
  });

  test('wrong credentials show a generic, non-enumerating error', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email address').fill('wrongpass@e2e.test');
    await page.getByLabel('Password').fill('whatever');

    await expect(page.getByRole('button', { name: 'Log in' })).toBeEnabled();
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(errorAlert(page)).toContainText('Invalid email or password.');
  });

  test('an unconfirmed account shows a resend-confirmation link', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email address').fill('unconfirmed@e2e.test');
    await page.getByLabel('Password').fill('correct-password');

    await expect(page.getByRole('button', { name: 'Log in' })).toBeEnabled();
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(errorAlert(page)).toContainText('Please confirm your email before logging in.');
    await expect(page.getByRole('link', { name: 'Resend confirmation email' })).toBeVisible();
  });

  test('too many attempts shows a rate-limit message', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email address').fill('ratelimited@e2e.test');
    await page.getByLabel('Password').fill('correct-password');

    await expect(page.getByRole('button', { name: 'Log in' })).toBeEnabled();
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(errorAlert(page)).toContainText('Too many attempts.');
  });

  test('a brand-new (not yet onboarded) user is sent to onboarding after logging in', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email address').fill('new-user@e2e.test');
    await page.getByLabel('Password').fill('correct-password');

    await expect(page.getByRole('button', { name: 'Log in' })).toBeEnabled();
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/onboarding$/);
    await expect(page.getByRole('heading', { name: 'What should we call you?' })).toBeVisible();
  });

  test('an already-onboarded user is sent past the onboarding gate after logging in', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email address').fill('onboarded-user@e2e.test');
    await page.getByLabel('Password').fill('correct-password');

    await expect(page.getByRole('button', { name: 'Log in' })).toBeEnabled();
    await page.getByRole('button', { name: 'Log in' }).click();

    // default post-login destination per DEFAULT_AFTER_LOGIN in login/actions.ts
    await expect(page).toHaveURL('/dashboard');
  });

  test('rejects an open-redirect attempt via the next param, falling back to the default page', async ({ page }) => {
    await page.goto('/login?next=https%3A%2F%2Fevil.example%2Fphish');

    await page.getByLabel('Email address').fill('onboarded-user@e2e.test');
    await page.getByLabel('Password').fill('correct-password');

    await expect(page.getByRole('button', { name: 'Log in' })).toBeEnabled();
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL('/dashboard');
  });

  test('the submit button stays disabled until the CAPTCHA resolves', async ({ page }) => {
    await page.route(/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js/, async (route) => {
      // never resolve the widget for this one test, so captchaToken stays empty
      await route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    });
    await page.goto('/login');

    await page.getByLabel('Email address').fill('onboarded-user@e2e.test');
    await page.getByLabel('Password').fill('correct-password');

    await expect(page.getByRole('button', { name: 'Log in' })).toBeDisabled();
  });

  test('surfaces a CAPTCHA-specific error when Supabase itself rejects the token', async ({ page }) => {
    await setCaptchaToken(page, 'trigger-captcha-fail');
    await page.goto('/login');

    await page.getByLabel('Email address').fill('onboarded-user@e2e.test');
    await page.getByLabel('Password').fill('correct-password');

    await expect(page.getByRole('button', { name: 'Log in' })).toBeEnabled();
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(errorAlert(page)).toContainText('CAPTCHA verification failed');
  });
});