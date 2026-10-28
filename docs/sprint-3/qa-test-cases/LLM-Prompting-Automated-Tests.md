# LLM Prompting and Daily Challenge Tests

Prepared on 28 October 2026 against main commit `edee24400e8b2d54a98b1ef0d07fb95b94186c7f`.

## Coverage

Paths below are relative to `my-app/`.

| Suite | Checks | Purpose |
|---|---:|---|
| `lib/daily-challenge/llm.test.ts` | 27 | Compatible provider schema, independent local validation, reasoning settings, JSON parsing, retry deadlines, aborts and answer leak matching. |
| `lib/daily-challenge/prompts.test.ts` | 29 | Learner-visible answer guards, secret exclusion, table summarisation, feedback consistency and fallback, generated MCQ source evidence and verification. |
| `lib/daily-challenge/rateLimit.test.ts` | 31 | Per-user/global model budgets, malformed responses, database failures, route availability and HTTP 429 responses. |
| `app/api/challenge/promptingRoutes.test.ts` | 10 | Actual generation/submission handlers with prompting: safe fallback, caching, authentication, private answer storage, human question fallback and shared model deadlines. |
| `app/api/challenge/routes.test.ts` | 38 | Actual hint/status/submit handlers: authentication, rate limits, payloads, ownership, hints, attempts, expiry, grading errors, server reward inputs and conflicts. |
| `lib/daily-challenge/types.test.ts` | 25 | Fixed XP acceptance examples, the minimum reward, shared constants and category/tier labels. TypeScript interfaces are checked by the compiler, not runtime tests. |
| `supabase/tests/database/daily_challenge_rate_limits.test.sql` | 34 | Actual migrated rate-limit RPC, stored counts, boundaries, retry delays, separate user/global keys, expired-window cleanup, RLS and server-only execution. |
| `e2e/dailyChallenge.spec.ts` | 1 journey | Login, challenge selection, hint/XP display, incorrect attempt, successful retry, solution visibility, refresh and completed hub state. |

There are **160 added unit/handler tests**, **34 new pgTAP assertions**, and **one new Playwright journey**. The SQL assertions are not part of the Vitest count.

The package includes implementation fixes because the LLM regression tests would expose defects in the unfixed main source. It does not include badge tests or workflow changes from their separate PRs.

## Implementation changes

- LLM-01: check the title as well as scenario, task and hints for answer leakage.
- LLM-02: detect alphabetic answer terms without case sensitivity and preserve word boundaries.
- LLM-03: use the compatible provider-schema helper while retaining local Zod bounds.
- LLM-04: summarise long model-input tables without changing the original challenge data.
- LLM-05: give model jobs in a route one 40-second deadline, clamp individual attempts and abort stalled model calls. Feedback attempts additionally have an 8-second cap.
- LLM-06: pass explicitly configured low/medium/high reasoning effort into requests.

Additional guards cover percentage spellings, narrow single-character answer claims, familiar contradictory feedback, forbidden all/none-of-the-above options and selected-answer evidence in source quotes. Source material is serialised as data and prompts mark it as untrusted. Model budget outages skip optional generation; ordinary route outages retain the intended availability behaviour.

## Run unit tests

Use Node.js 22 and the locked project dependencies. From `my-app/`:

```powershell
npm ci
npx vitest run --project unit lib/daily-challenge app/api/challenge
npx vitest run --project unit
npx tsc --noEmit
```

The focused command should run 160 tests on the recorded base. The full total changes as other test PRs merge. To produce the existing JUnit and JSON reports:

```powershell
npm run test:report -- --project unit
```

Generated reports belong in `reports/unit/` and should not be committed.

## Run the database suite

Docker Desktop must be running. Use a disposable local Supabase instance with all repository migrations applied, from `my-app/`:

```powershell
npx supabase start
npx supabase test db supabase/tests/database/daily_challenge_rate_limits.test.sql
```

Expected for this file: **34 passing assertions**. Full startup is used so the Docker network needed by the test runner exists. The comment-only `supabase/seed.sql` satisfies the repository's configured seed path; migrations already provide the catalogue. No production connection or linked-project flag is required.

The suite creates uniquely prefixed budget rows, tests real functions and roles, and rolls back its fixtures and temporary pgTAP grants. It does not sleep across time windows or change application migrations.

After the badge database fixture fixes in PR #49 are integrated, run all SQL suites:

```powershell
npx supabase test db
```

Before that integration, current main's older `profile_gamification.test.sql` has known stale fixtures. A failure in that file is separate from the new rate-limit suite; the combined database run must still be resolved before claiming it passed.

When finished:

```powershell
npx supabase stop
```

Do not reset an existing development database containing data you need. Another Supabase project may already occupy the configured ports; stop that identified project before starting this one.

## Run the Playwright journey

From `my-app/`:

```powershell
npx playwright install chromium
npx playwright test e2e/dailyChallenge.spec.ts
```

Expected: **one passing browser test**. The existing Playwright configuration starts the local app and simulated Supabase authentication service. Docker and a real model API key are not needed for this browser test. Use `localhost` as configured; leave the test servers' ports free.

For the whole browser suite:

```powershell
npx playwright test
```

Existing reports are written to `reports/e2e/`; view HTML with `npm run test:e2e:report`.

## Recorded results and pending pipeline work

- Node.js 22.23.4: **249 unit tests passed across 15 files**, comprising 89 existing tests and 160 additions.
- TypeScript and ESLint on all 14 included TypeScript files passed.
- The new Playwright journey passed. The complete browser run on the recorded main base had **20 passes and one failure**, in the existing signup test's outdated account-exists message expectation. PR #48 already contains its correction. That auth file is unchanged by this package.
- All **34 new SQL assertions passed** using actual pgTAP in disposable PGlite after all 18 migrations, with Supabase auth schema, identity functions, roles and default grants emulated. This is not a native Docker/Supabase result; that run remains pending for this new suite.

PR #48 remains open as checked during preparation. Its unit command discovers these `.test.ts` files, and its Playwright command discovers the new `.spec.ts` file. It has no database-test job yet. Running the SQL suite in CI requires a separate native Supabase job; adding the SQL file alone is insufficient.

The recorded main uses `supabase/tests/database/`; PR #48 moves SQL tests to `supabase/tests/db/`. Keep one copy of the new rate-limit suite in the team's chosen folder after integration and update paths in this document. Existing branch-protection requirements can remain Expected until the pipeline workflow is present on the PR branch.

## Limits

The unit/handler tests simulate provider, auth, storage and grading boundaries. The browser journey renders real Next.js pages but intercepts challenge API responses and simulates grading and persistence. Refresh checks establish UI behaviour with that fixture, not actual database durability. This is a browser E2E journey with mocked services, not live full-stack integration.

String matching does not rule out arbitrary paraphrases or semantic answer disclosure. Quote checks and model agreement do not prove MCQ correctness and can reject valid paraphrases. Prompt instructions do not establish live injection resistance. The shared deadline bounds model calls, not database or Qiskit I/O, so it does not guarantee total route completion within 60 seconds.

Configured-provider schema acceptance, live generation accuracy, latency, cost, transport failures and injection success still require separate evaluation. No real provider requests, production credentials, deployment or release sign-off are included. Existing hint-save error handling, reward failure recovery and concurrent first-pass XP risks are not resolved by this test package. Sequential database assertions do not establish independent-connection concurrency safety.
