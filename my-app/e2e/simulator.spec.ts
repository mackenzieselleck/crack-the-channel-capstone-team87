import { expect, test } from '@playwright/test';

test.describe('BB84 Simulator', () => {
  test('shows the role selection screen', async ({ page }) => {
    await page.goto('/simulator');

    await expect(
      page.getByRole('heading', { name: 'Choose your role' })
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Play as Alice' })
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Play as Bob' })
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Play as Eve' })
    ).toBeVisible();
  });
});