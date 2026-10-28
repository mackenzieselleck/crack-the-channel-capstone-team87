# Badge Logic Unit and Database Tests

## Test files

Paths are relative to the repository root.

| File | Coverage |
|---|---|
| `my-app/components/badges/badgeArt.test.tsx` | 13 unit tests for static rendering, disabled Rive, missing URLs, changed images and the signatures of all eight PNG assets. |
| `my-app/components/badges/badgeUnlockProvider.test.tsx` | 13 unit tests for dismissal errors and retries, duplicate actions, Escape, focus, queue deduplication, query scope, invalid responses, recovery, navigation, cleanup and simulated persistence across remounts. |
| `my-app/supabase/tests/database/profile_gamification.test.sql` | 55 pgTAP assertions for quiz prerequisites and pass thresholds, first-pass XP, retakes, protected profile fields, daily rewards and rejected inputs. Existing fixtures and response expectations are updated for the current badge schema. |
| `my-app/supabase/tests/database/badge_logic.test.sql` | 57 pgTAP assertions for the eight badge definitions, module and daily award hooks, champion and streak boundaries, duplicates, reward metadata, malformed rules, permissions, ownership and saved dismissals. |

The unit tests simulate Supabase responses and jsdom dialog methods. They do not establish native browser inertness or live browser/database integration. SQL tests execute the actual migrated functions and exercise database roles and row-level security.

## Run locally

Use Node.js 22, matching the proposed CI pipeline. From `my-app/`:

```powershell
npm ci
npm run test:badges
npm run test:unit
npx tsc --noEmit
```

To generate unit reports:

```powershell
npm run test:report -- --project unit
```

Reports are written to `my-app/reports/unit/`. Do not commit generated reports.

Database tests require Docker running and a disposable local Supabase database with current migrations:

```powershell
npm run db:start
npm run test:db
npm run db:stop
```

These commands use local configuration and do not require production credentials. Both SQL suites create their own fixtures inside transactions and roll them back. The badge suite publishes modules only inside its rolled-back transaction. `seed.sql` contains comments because migrations already create the application catalogue.

Copies sharing the configured Supabase project ID can share the same local database instance. Do not reset a local development database containing data you need.

## CI integration

As checked on 28 October 2026, pipeline PR #48 is open. Its existing `npx vitest run --project unit` command discovers the badge unit tests automatically. It does not yet include a native Supabase database-test job. SQL tests require that separate job; adding the files alone does not run them in CI.

Current main stores SQL tests in `supabase/tests/database/`. PR #48 moves the suite to `supabase/tests/db/`. When integrating that move, keep one copy of each SQL suite and update the paths in this document. No workflow file is included in this badge-only package.

## Recorded validation and limits

The prepared suites previously passed all **26 badge unit tests** and **112 SQL assertions**. SQL validation used actual pgTAP in disposable PGlite after applying all 18 migrations, with Supabase auth schema, identity functions, roles and default grants emulated. Native Docker/Supabase validation and the proposed GitHub-hosted database job have not been completed on the preparation computer because Docker is unavailable. Confirm those results separately.

The tests do not establish live realtime delivery or reconnects, PostgREST schema-cache refresh, live sign-out/sign-in, process-restart persistence, independent-connection concurrency, production layout or recovery from missing/corrupt images. Rive remains disabled. Concurrent first-pass XP and daily reward failure recovery remain separate follow-up risks. Passing sequential tests do not establish overlapping-request safety.
