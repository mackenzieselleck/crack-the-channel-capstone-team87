# **Crack the channel - Sprint 3 Auth Automated Test Cases:**

|**Team**|Team 87 - IBM Cyber Security: Quantum Risks|
|---|---|
|<br>**Client**|IBM via RMIT Capstone Consultancy|
|<br>**Project**|Crack the Channel - Interactive QKD (BB84) Learning Platform|
|<br>**Prepared by**|Sarah Salman - Dev|
|<br>**Document Status**|<sup>Sprint 3: Auth automated test cases - executed</sup>|

## **1. Purpose**

This document records the automated test coverage built for the authentication surface (login, signup, onboarding gate, email confirmation/resend, forgot/reset password, and protected-route guards), as a follow-up to the manual cases in `Sprint-2-QA-Test-Cases.md` section 4.1 (AUTH-01-AUTH-10).

It does not replace that document. Where an automated case below exercises the same behaviour as one of the original AUTH-01-AUTH-10 rows, section 5 maps the two together. Several of the original rows are not covered by automation.

## **2. Testing Scope**

**In scope (automated):**

- Server-side validation and branching logic for login, signup, forgot-password, reset-password and resend-confirmation (unit tests, Vitest)
- The onboarding gate and generic auth guard (`requireUser`/`requireOnboarding`)
- Recovery-session validity windowing (password reset links)
- The open-redirect guard on the `next` query param
- End-to-end browser behaviour for the flows above (Playwright, real Chromium, real rendering and real server actions)

**Out of scope (not automated by this suite):**

- The logout action itself (AUTH-05)
- Session persistence across a page refresh (AUTH-06)
- Automatic profile creation on signup (AUTH-08) - this depends on a real Postgres trigger, which the mocked Auth/REST layer below does not reproduce
- Actually completing and submitting the onboarding form (the gate that redirects to onboarding is covered; filling it in and saving it is not) (part of AUTH-09)
- The full signup -> onboard -> logout -> login-again round trip (AUTH-10), since it depends on the gaps above

Section 5 maps these gaps back to the original test IDs.

## **3. Environment / Assumptions**

**Test environment:**

- **Unit tests:** Vitest, run against the real server action/guard code with Supabase's JS client mocked at the module boundary
- **End-to-end tests:** Playwright against a real `next dev` server and real Chromium, with:
  - A hand-written Node HTTP server standing in for Supabase's Auth (GoTrue) and REST (PostgREST) APIs, keyed by the email/password in each request (no shared state, safe under parallel workers)
  - The Cloudflare Turnstile widget script intercepted at the browser level and replaced with a mock that resolves instantly
- **No live Supabase project or Turnstile site key is used.** trade-off: it lets every branch (CAPTCHA rejection, rate limiting, unconfirmed email, etc.) be triggered on demand and run in CI without live credentials, but it also means nothing here exercises the real Supabase project, real email delivery, or the real `auth.users` -> `profiles` trigger.

**Assumptions:**

1. The mock Auth/REST server's behaviour is an accurate enough stand-in for the real GoTrue/PostgREST responses the app's own code branches on (verified against `@supabase/auth-js`/`@supabase/postgrest-js` source, not just by trial and error).
2. A case marked **Pass** below means it passed against this mocked environment, not against the live Supabase project.

## **4. Test Cases**

### **4.1 Unit / Server Action Test Cases**

|**ID**|**Test Case**|**Scenario**|**Expected Result**|**Status**|
|---|---|---|---|---|
|AUTH-U-01|Login - invalid input rejected client-side|Submit login with an invalid email or an empty password|Rejected before Supabase is called|Pass|
|AUTH-U-02|Login - missing CAPTCHA rejected|Submit login with no CAPTCHA token|Rejected before Supabase is called|Pass|
|AUTH-U-03|Login - CAPTCHA rejected by Supabase|Supabase rejects the CAPTCHA token|CAPTCHA-specific error message returned|Pass|
|AUTH-U-04|Login - unconfirmed email|Log in to an unconfirmed account|Error flags the unconfirmed email and offers a resend link|Pass|
|AUTH-U-05|Login - rate limited|Supabase returns HTTP 429|Rate-limit message returned|Pass|
|AUTH-U-06|Login - wrong credentials (no enumeration)|Log in with the wrong password|Generic, non-enumerating error returned; no profile lookup or redirect performed|Pass|
|AUTH-U-07|Login - onboarding gate|Log in with a profile that has no name on file, or blank/whitespace name fields|Redirects to `/onboarding`|Pass|
|AUTH-U-08|Login - post-login redirect|Log in with no `next` param, a safe same-origin `next`, and a cross-origin `next`|Goes to the default destination, honours the safe `next`, and falls back to default for the cross-origin one (open-redirect protection)|Pass|
|AUTH-U-09|Signup - confirmation URL|Submit a signup|Supabase receives a real, interpolated confirmation URL (not a template string)|Pass|
|AUTH-U-10|Signup - missing CAPTCHA rejected|Submit signup with no CAPTCHA token|Rejected before Supabase is called|Pass|
|AUTH-U-11|Signup - invalid input rejected|Submit an invalid email, a password failing complexity rules, or a non-matching confirm-password|Rejected client-side with an appropriate message|Pass|
|AUTH-U-12|Signup - Supabase error branches|Supabase rejects the CAPTCHA, reports `weak_password`, reports the account already exists, or some other failure|CAPTCHA-specific / weak-password / generic fallback message shown as appropriate; account-already-exists is never distinguishable from any other failure (no enumeration)|Pass|
|AUTH-U-13|Forgot password - input/CAPTCHA validation|Submit an invalid email, or no CAPTCHA token|Rejected before Supabase is called|Pass|
|AUTH-U-14|Forgot password - CAPTCHA rejected by Supabase|Supabase rejects the CAPTCHA token|CAPTCHA-specific error returned|Pass|
|AUTH-U-15|Forgot password - no account enumeration|Submit for an existing account, a non-existing account, and a case where Supabase fails for an unrelated reason|Identical generic success message in all three cases|Pass|
|AUTH-U-16|Forgot password - redirect URL|Submit a forgot-password request|Correct `redirectTo` URL sent to Supabase|Pass|
|AUTH-U-17|Reset password - input validation|Submit a weak new password or mismatched password/confirm fields|Rejected before the recovery session is even checked|Pass|
|AUTH-U-18|Reset password - expired/invalid link|Submit a new password without a valid recovery session|Expired-link message returned|Pass|
|AUTH-U-19|Reset password - Supabase error branches|Supabase reports the new password reuses the old one, reports it as weak, or fails for another reason|Appropriate specific or generic message returned|Pass|
|AUTH-U-20|Reset password - success|Submit a valid new password with a valid recovery session|Password is updated, the user is signed out of every session (`scope: 'global'`), and redirected|Pass|
|AUTH-U-21|Resend confirmation - input/CAPTCHA validation|Submit an invalid email, or no CAPTCHA token|Rejected before Supabase is called|Pass|
|AUTH-U-22|Resend confirmation - CAPTCHA rejected by Supabase|Supabase rejects the CAPTCHA token|CAPTCHA-specific error returned|Pass|
|AUTH-U-23|Resend confirmation - rate limited|Supabase returns `over_email_send_rate_limit`, or a bare HTTP 429 with no specific code|Rate-limit message returned in both cases|Pass|
|AUTH-U-24|Resend confirmation - no account enumeration|Submit for an existing account and an unknown account|Identical generic message in both cases; correct `emailRedirectTo` sent|Pass|
|AUTH-U-25|Route guard - `requireUser()`|Call it unauthenticated, with a Supabase error, and authenticated|Redirects to `/login` in the first two cases; returns the client and user when authenticated|Pass|
|AUTH-U-26|Route guard - `requireOnboarding()`|Call it unauthenticated, with a missing profile row, with blank name fields, with a failed profile query, and with a complete profile|Redirects to `/login` or `/onboarding` as appropriate; throws (does **not** redirect) if the profile query itself errors; returns the user and profile once onboarding is complete|Pass|
|AUTH-U-27|Recovery session validity window|Evaluate a recovery/OTP session at various ages: fresh, at the edge of the allowed window, past it, with missing/invalid claims, and with a future-dated timestamp|Valid only for a fresh recovery or OTP login within the allowed window; invalid in every other case, including a future-dated timestamp (clock-skew/tamper protection)|Pass|
|AUTH-U-28|Open-redirect guard (`safeNext`)|Evaluate a `next` value that is null/undefined/empty, same-origin, cross-origin, protocol-relative off-site, or unparsable|Same-origin values (including their query string and hash) pass through unchanged; every off-site or malformed value falls back to the default destination|Pass|

### **4.2 End-to-End (Browser) Test Cases**

|**ID**|**Test Case**|**Steps**|**Expected Result**|**Status**|
|---|---|---|---|---|
|AUTH-E-01|Signup happy path|Fill in valid signup details, complete the CAPTCHA, submit|Redirected to the check-your-email page|Pass|
|AUTH-E-02|Signup - password mismatch|Enter two different values in password/confirm, submit|Client-side error shown; stays on the signup page|Pass|
|AUTH-E-03|Signup - account already exists|Submit signup for an email Supabase reports as already registered|Generic error shown (no enumeration)|Pass|
|AUTH-E-04|Login - wrong credentials|Submit login with the wrong password|Generic, non-enumerating error shown|Pass|
|AUTH-E-05|Login - unconfirmed account|Log in to an unconfirmed account|Error shown with a visible "Resend confirmation email" link|Pass|
|AUTH-E-06|Login - rate limited|Submit login that Supabase rate-limits|Rate-limit message shown|Pass|
|AUTH-E-07|Login - new user onboarding redirect|Log in as a user with no profile name set|Redirected to `/onboarding`|Pass|
|AUTH-E-08|Login - returning user past onboarding|Log in as a user who has already onboarded|Redirected past the onboarding gate into the app|Pass|
|AUTH-E-09|Login - open-redirect protection|Log in with a crafted cross-origin `next` param on the URL|Falls back to the default destination instead of following it|Pass|
|AUTH-E-10|Login - CAPTCHA gating|Load the login form, do not complete the CAPTCHA|Submit button stays disabled until the CAPTCHA widget resolves|Pass|
|AUTH-E-11|Login - CAPTCHA rejected by Supabase|Submit login where Supabase itself rejects the CAPTCHA token|CAPTCHA-specific error shown|Pass|
|AUTH-E-12|Forgot password - no account enumeration|Submit forgot-password for any email address|Same generic "if an account exists..." message shown|Pass|
|AUTH-E-13|Forgot password - CAPTCHA rejected|Submit forgot-password where Supabase rejects the CAPTCHA token|CAPTCHA-specific error shown|Pass|
|AUTH-E-14|Reset-password link validation|Open the reset-password page via an invalid/expired link|"Link expired" message shown instead of the password form|Pass|
|AUTH-E-15|Resend confirmation - no account enumeration|Submit resend for an existing account and an unknown account|Same generic message shown both times|Pass|
|AUTH-E-16|Resend confirmation - cooldown|Successfully resend a confirmation email, then try again immediately|A cooldown is enforced before another resend is allowed|Pass|
|AUTH-E-17|Resend confirmation - rate limited|Submit resend that Supabase rate-limits|Rate-limit error shown|Pass|
|AUTH-E-18|Route guard - onboarding|Visit `/onboarding` while signed out|Redirected to `/login`|Pass|
|AUTH-E-19|Route guard - learning route|Visit a protected learning route while signed out|Redirected to `/login`|Pass|
|AUTH-E-20|Route guard - dashboard|Visit the dashboard while signed out|Redirected to `/login`|Pass|

## **5. Traceability to the Master QA Document**

|**Master ID**|**Master Test Case**|**Automated coverage**|**Coverage status**|
|---|---|---|---|
|AUTH-01|Valid signup|AUTH-U-09/10/11, AUTH-E-01|Automated|
|AUTH-02|Invalid signup|AUTH-U-11/12, AUTH-E-02/03|Automated|
|AUTH-03|Valid login|AUTH-U-07/08, AUTH-E-07/08|Automated|
|AUTH-04|Invalid login|AUTH-U-03/04/05/06, AUTH-E-04/05/06/11|Automated|
|AUTH-05|Logout|-|**Not automated** - no test drives the logout button/action|
|AUTH-06|Session Persistence|-|**Not automated** - no test reloads the page mid-session|
|AUTH-07|Protected Route|AUTH-U-25/26, AUTH-E-18/19/20|Automated|
|AUTH-08|Profile Creation|-|**Not automated** - depends on a real Postgres trigger, outside the mocked REST surface|
|AUTH-09|Onboarding|AUTH-U-07/26, AUTH-E-07/08 (gate only)|**Partially automated** - redirect gate is covered; filling in and saving the onboarding form is not|
|AUTH-10|Return Login|-|**Not automated** - depends on AUTH-05/06/08/09 above|

## **6. How to run this suite**

```
npm test            # unit tests (Vitest)
npm run test:e2e    # end-to-end tests (Playwright, starts its own dev server + mock Auth server)
npm run test:report      # unit tests with junit/json output under reports/unit
npm run test:e2e:report  # opens the last Playwright HTML report
```