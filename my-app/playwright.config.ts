import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config for the auth surface (login, signup, onboarding,
 * email-confirmation/resend, forgot/reset password, route guards).
 *
 * These specs run against a locally-started `next dev` server with all
 * Supabase Auth + Turnstile network calls intercepted (see e2e/mocks.ts) -
 * The mocked responses mirror the Supabase/Turnstile shapes the server 
 * actions already branch on (see app/(auth)/**\/actions.ts), so these 
 * tests exercise real rendering, real client-side JS, and the real server 
 * actions - only the outbound calls to Supabase/Turnstile's own servers are faked.
 *
 * Important: the app must be reached via `localhost`, not `127.0.0.1` 
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/e2e/html', open: 'never' }],
    ['junit', { outputFile: 'reports/e2e/junit.xml' }],
    ['json', { outputFile: 'reports/e2e/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // This @playwright/test version's default headless-shell binary
        // revision doesn't match what's preinstalled in this environment
        // (and `playwright install` isn't available here) - launch the
        // preinstalled full Chromium directly instead.
         ...(process.env.PW_CHROMIUM_PATH && {
        launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH },
        }),
      },
    },
  ],
  webServer: [
    {
      // Stands in for Supabase's Auth + REST APIs (see e2e/mocks.ts for why:
      // no live Supabase project is configured in this environment).
      command: 'node e2e/mockSupabaseServer.cjs',
      url: 'http://127.0.0.1:54329/health',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: 'npm run dev -- --port 3100',
      url: 'http://localhost:3100',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        // Any non-empty value satisfies the client-side `siteKey={...!}`
        // non-null assertion; the real Turnstile widget script itself is
        // intercepted at the browser level (see e2e/mocks.ts) so this key
        // is never actually sent anywhere.
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3100',
        NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54329',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'e2e-mock-anon-key',
      },
    },
  ],
});