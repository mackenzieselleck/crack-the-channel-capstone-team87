# **Crack the channel - Sprint 3 Auth Test Execution Report:**

|**Team**|Team 87 - IBM Cyber Security: Quantum Risks|
|---|---|
|<br>**Client**|IBM via RMIT Capstone Consultancy|
|<br>**Project**|Crack the Channel - Interactive QKD (BB84) Learning Platform|
|<br>**Prepared by**|Sarah Salman - Dev|
|<br>**Document Status**|<sup>Sprint 2: Auth test execution report</sup>|

## **1. Summary**

|||
|---|---|
|**Run date**|2026-10-18|
|**Suite**|`Sprint-2-Auth-Automated-Test-Cases.md` (AUTH-U-01-28, AUTH-E-01-20)|
|**Unit tests**|82 / 82 passed|
|**End-to-end tests**|20 / 20 passed|
|**Total**|102 / 102 passed|
|**Overall result**|**Pass**|

Both suites were run to completion (not sampled or partially run), twice in succession for the end-to-end suite to rule out flakiness. No test is currently skipped or marked as expected-to-fail.

## **2. Environment**

|||
|---|---|
|**Node**|v22.22.2|
|**Unit test runner**|Vitest|
|**End-to-end runner**|Playwright (`@playwright/test` 1.64.1), Chromium|
|**App under test**|`next dev`, local, port 3100|
|**Auth/REST backend**|Hand-written mock of Supabase's GoTrue Auth API and PostgREST API (`e2e/mockSupabaseServer.cjs`) - **no live Supabase project involved**|
|**CAPTCHA**|Cloudflare Turnstile intercepted and replaced with a mock widget (`e2e/mocks.ts`) - **no live Turnstile site key involved**|

Because the Auth/REST layer and Turnstile are both mocked, this run verifies the application's own logic (validation, branching on each Supabase response shape, redirects, rendering) thoroughly and repeatably, but it does not verify the real Supabase project's configuration, real email delivery, or the real `auth.users -> profiles` database trigger. See section 5.

## **3. Results by Suite**

|**Suite**|**File**|**Tests**|**Result**|
|---|---|---|---|
|Login|`app/(auth)/login/actions.test.ts`|20|Pass|
|Signup|`app/(auth)/signup/actions.test.ts`|12|Pass|
|Password reset|`app/(auth)/passwordResetActions.test.ts`|13|Pass|
|Resend confirmation|`app/(auth)/resendActions.test.ts`|8|Pass|
|Route guards|`lib/auth/guards.test.ts`|8|Pass|
|Recovery session|`lib/auth/recoverySession.test.ts`|8|Pass|
|Open-redirect guard|`lib/auth/safeRedirect.test.ts`|10|Pass|
|Module page (regression)|`app/learn/[slug]/page.test.tsx`|3|Pass|
|**Unit total**|8 files|**82**|**Pass**|
|Signup + login|`e2e/signupLogin.spec.ts`|12|Pass|
|Password reset + resend + guards|`e2e/passwordResetAndGuards.spec.ts`|8|Pass|
|**End-to-end total**|2 files|**20**|**Pass**|

## **4. Issues Found and Fixed During This Run**

The first e2e run surfaced two bugs, both in the test infrastructure, which were fixed and the suite re-run to confirm:

1. **Ambiguous error-message locator (8 tests affected).** Every assertion written as `page.getByRole('alert')` also matched Next.js's own router-announcer element (`id="__next-route-announcer__"`), which carries `role="alert"` on every page by design. Depending on timing this produced either a Playwright "strict mode violation" (two elements matched) or a false negative (the announcer matched before the real error had rendered). Fixed by adding a shared `errorAlert(page)` helper in `e2e/mocks.ts` that explicitly excludes the announcer, and using it everywhere a form/server error is asserted on.
2. **Mock server read the CAPTCHA token from the wrong field on `/auth/v1/recover` (1 test affected).** `@supabase/auth-js`'s `resetPasswordForEmail()` sends the CAPTCHA token nested at `body.gotrue_meta_security.captcha_token`, matching every other GoTrue endpoint - but the mock's `handleRecover()` was checking `body.captchaToken` directly, so the forced-CAPTCHA-failure test case was silently never triggered and the request always "succeeded". Fixed to match the same field the other handlers already check.

Both fixes are confined to the test suite (`e2e/mocks.ts`, `e2e/mockSupabaseServer.cjs`, and the two spec files); no application code changed as a result.

## **5. Known Limitations / Not Covered by This Run**

- **Mocked backend, not live Supabase.** This run does not exercise the real Supabase project, real email delivery, Turnstile's real verification service, or the `profiles` table's auto-creation trigger.
- **Logout (AUTH-05)** is not exercised by any automated test.
- **Session persistence across a page refresh (AUTH-06)** is not exercised.
- **Profile auto-creation on signup (AUTH-08)** is not exercised - this would need a real (or realistically replicated) Postgres instance, not the mocked REST surface.
- **Completing the onboarding form itself (part of AUTH-09)** is not exercised - the redirect *gate* into/past onboarding is covered, but no test fills in and submits the form.
- **The full signup -> onboard -> logout -> login-again round trip (AUTH-10)** is not exercised, since it depends on the gaps above.

See `Sprint-3/qa-test-cases/Auth-tests.md` section 5 for the full traceability mapping against the original manual AUTH-01-AUTH-10 cases.

## **6. Verdict**

All 102 automated checks pass against the mocked environment described above. The authentication logic this suite targets - input validation, CAPTCHA handling, every branch of Supabase's error responses, the onboarding gate, protected-route guards, the password-reset recovery window, and the open-redirect guard - is covered and green. The gaps in section 5 remain open and are recommended as either additional automated cases or manual QA passes before sign-off on AUTH-05, AUTH-06, AUTH-08, AUTH-09 and AUTH-10.