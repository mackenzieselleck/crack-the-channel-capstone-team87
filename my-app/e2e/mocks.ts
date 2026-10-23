import type { Locator, Page } from '@playwright/test';

/**
 * The element that actually carries a form/server error message, as opposed
 * to Next's own router-announcer div (id="__next-route-announcer__"), which
 * is present on every page and also has role="alert" (it's how Next tells
 * screen readers a client-side navigation happened). A bare
 * `page.getByRole('alert')` matches both whenever our error alert is on
 * screen at the same time - either a strict-mode violation (both present)
 * or, during Playwright's auto-retry, a false "resolved" match on the empty
 * announcer before our alert has rendered - so every assertion against a
 * form error should go through this instead of getByRole('alert') directly.
 */
export function errorAlert(page: Page): Locator {
  return page.locator('[role="alert"]:not(#__next-route-announcer__)');
}

/**
 * Every Supabase Auth/REST call made by these flows happens inside Next.js
 * server actions (plain server-side `fetch`, invisible to the browser), so
 * that side is handled by pointing NEXT_PUBLIC_SUPABASE_URL at
 * e2e/mock-supabase-server.cjs (see playwright.config.ts) rather than by
 * Playwright route interception.
 *
 * The Cloudflare Turnstile widget is different: it's loaded by a <script>
 * tag the browser requests directly, so it needs intercepting here - there
 * is no live Turnstile site key configured in this environment, and we
 * don't want real network calls to challenges.cloudflare.com in tests
 * anyway.
 *
 * Note: this only works when the app is reached via `localhost`, not
 * `127.0.0.1` - see baseURL in playwright.config.ts. Next's dev server
 * blocks its own HMR websocket for origins it doesn't recognize (a
 * `next.config.ts`/`allowedDevOrigins` setting), and when that handshake
 * fails, this app's client-side effects - including the one that mounts
 * the Turnstile widget - silently never run at all (no console error, no
 * hydration warning). `localhost` is in the default allowed-origins list;
 * `127.0.0.1` is not.
 */
export async function mockTurnstile(page: Page) {

    //fakes the Cloudflare CAPTCHA widget so tests don’t need a real site key

  await page.route(/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js/, async (route) => {
    const url = new URL(route.request().url());
    const onloadName = url.searchParams.get('onload') || 'onloadTurnstileCallback';

    const body = `
      (function () {
        window.turnstile = {
          render: function (container, opts) {
            var id = 'mock-widget-' + Math.random().toString(36).slice(2);
            setTimeout(function () {
              var token = window.__E2E_CAPTCHA_TOKEN__ || 'mock-captcha-token';
              if (opts && typeof opts.callback === 'function') opts.callback(token);
            }, 10);
            return id;
          },
          reset: function () {},
          remove: function () {},
          getResponse: function () {
            return window.__E2E_CAPTCHA_TOKEN__ || 'mock-captcha-token';
          },
          execute: function () {},
          isExpired: function () { return false; },
        };
        if (typeof window['${onloadName}'] === 'function') window['${onloadName}']();
        else window['${onloadName}'] = window['${onloadName}'] || function () {};
      })();
    `;

    await route.fulfill({ status: 200, contentType: 'application/javascript', body });
  });
}

/**
 * Makes the mocked Turnstile widget report a specific token on success,
 * e.g. the sentinel 'trigger-captcha-fail' that e2e/mock-supabase-server.cjs
 * recognizes and rejects server-side, for testing the "Supabase rejected
 * the CAPTCHA" branch.
 */
export async function setCaptchaToken(page: Page, token: string) {
  await page.addInitScript((t) => {
    (window as unknown as { __E2E_CAPTCHA_TOKEN__?: string }).__E2E_CAPTCHA_TOKEN__ = t;
  }, token);
}