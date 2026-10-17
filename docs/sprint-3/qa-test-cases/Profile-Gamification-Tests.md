# Profile Gamification Tests

Automated tests for the XP, badge and streak rules behind the learner profile.

| | |
|---|---|
| **Test file** | `my-app/supabase/tests/database/profile_gamification.test.sql` |
| **Run with** | `npm run test:db` (from `my-app/`) |
| **Assertions** | 55, all passing |
| **QA cases covered** | PROG-06, PROG-08, PROG-09 (see `docs/sprint-2/qa-test-cases/Sprint-2-QA-Test-Cases.md`) |
| **Requirements** | FR-19 (XP), FR-20 (Badges), ADR-014 (Daily Challenge XP and streaks) |

## 1. Why these are database tests

The profile page only displays XP, streaks and badges. The rules that award them are Postgres functions in our Supabase migrations, as ADR-014 requires (they must never be computed in the browser):

| Function / trigger | What it does | Migration |
|---|---|---|
| `submit_quiz()` | Grades a module test and, on the **first** pass, adds the module's XP and badge | `20261003010000_module_gamification.sql` |
| `record_daily_solve()` | Adds Daily Challenge XP and updates the streak and best streak | `20261004091722_daily_challenge_xp_fixes.sql` |
| `prevent_user_edit_protected_columns` | Trigger that stops learners editing their own XP, streak and dates | `20261003020000_daily_challenge_streak_scaffold.sql` |

The tests therefore run against a real local copy of the database, using [pgTAP](https://pgtap.org/), the testing tool built into the Supabase CLI.

## 2. How to run the tests

**You need:** Docker Desktop installed and open, and the project's npm packages installed (`npm install` in `my-app/`).

Run these in a normal terminal (VS Code: **Terminal → New Terminal**), **not** the Exec tab in Docker Desktop:

```
cd my-app
npx supabase db start
npm run test:db
```

- `npx supabase db start` starts a local database and applies every migration. The first run downloads the database images, which can take a few minutes. If the database is already running, it says so.
- `npm run test:db` runs the tests.

**Expected output:**

```
profile_gamification.test.sql .. ok
All tests successful.
Files=1, Tests=55
Result: PASS
```

The line `NOTICE: extension "pgtap" already exists` is normal and can be ignored.

When you're finished, stop the database with `npx supabase stop`.

### Troubleshooting

| Problem | Cause and fix |
|---|---|
| `/bin/sh: npx: not found` | You're typing in a shell inside the Docker container (prompt `/ #`). Use a terminal on your own computer instead. |
| `failed to connect to the docker API` | Docker Desktop isn't running. Open it and wait for "Engine running". |
| `Need to install the following packages: supabase@...` | You're not in the `my-app` folder. `cd` into it first. |

## 3. How the tests work

- The whole file runs inside one database transaction that is **rolled back** at the end, so no test data is ever saved.
- At the start it creates its own test data: three learners, a published module with 2 reading pages and 10 questions (so scores like 60% and 70% are exact), and a badge tied to that module.
- To act as a logged-in learner, the tests switch to Supabase's `authenticated` role and set the learner's ID the same way a real login would. Row-level security and permissions therefore behave as they do in the app.
- Daily Challenge tests switch to the `service_role`, which is the only role allowed to call `record_daily_solve()`, matching the `/api/challenge/submit` route.

## 4. What is tested

### 4.1 Module completion XP and badges (`submit_quiz`)

| Scenario | Expected result | QA case |
|---|---|---|
| Score 60% (below the 70% pass mark) | Fails, 0 XP, no badge | PROG-09 |
| Score exactly 70% | Passes, module XP (120 in the test) added to the profile, badge awarded | PROG-06, PROG-09 |
| Retake an already passed module at 100% | 0 XP, no duplicate badge | PROG-08 |
| Fail after already passing | 0 XP, earned XP is not removed, module stays passed | PROG-08 |
| Every attempt | Recorded in `quiz_attempts` | — |
| Reading not finished | Rejected, no XP | — |
| Logged-out visitor | Rejected | — |
| After awarding XP | The internal "trusted update" flag is switched back off | — |

### 4.2 Learners cannot change their own stats (anti-cheating)

| A logged-in learner tries to... | Expected result |
|---|---|
| Set their own XP, challenge streak, best streak, last challenge date or join date | Blocked with an error |
| Edit their own first and last name | Allowed |
| Award themselves a badge | Blocked by row-level security |
| View or edit another learner's profile | Not visible, nothing changed |
| Call `record_daily_solve()` directly | Permission denied |

The tests also confirm that only `service_role`, not `anon` or `authenticated`, can execute `record_daily_solve()`.

### 4.3 Daily Challenge XP formula (`record_daily_solve`)

**XP = max(10, tier × 50 − hints used × 10 − (attempt − 1) × 15)**

| Tier | Hints | Attempt | Calculation | XP |
|---|---|---|---|---|
| 1 | 0 | 1 | 50 | 50 |
| 3 | 0 | 1 | 150 | 150 |
| 2 | 2 | 2 | 100 − 20 − 15 | 65 |
| 3 | 3 | 3 | 150 − 30 − 30 | 90 |
| 1 | 1 | 3 | 50 − 10 − 30 | 10 |
| 1 | 3 | 3 | 50 − 30 − 30 = −10, raised to the minimum | 10 |

The test also checks that all of these add up correctly on the profile.

### 4.4 Streaks

A "day" is the **Melbourne** date, not the server's UTC date.

| Last solve was... | Streak before | Best before | Streak after | Best after |
|---|---|---|---|---|
| Never (first solve) | 0 | 0 | 1 | 1 |
| Earlier today | 1 | 1 | 1 (unchanged) | 1 |
| Yesterday | 4 | 4 | 5 | 5 |
| 2 days ago (missed a day) | 5 | 7 | 1 | 7 (kept) |
| Yesterday, below the best | 2 | 7 | 3 | 7 |

Empty (null) XP or streak values are treated as 0 rather than breaking the total.

### 4.5 Invalid input

These are all rejected, and the learner's XP is unchanged afterwards:

- Tier 0, tier 4, or no tier (valid: 1–3)
- Attempt 0 or attempt 4 (valid: 1–3)
- −1 hints, 4 hints, or no hint count (valid: 0–3)
- A user ID that doesn't exist

## 5. What is not covered

- **The profile page display.** These tests check the stored values, not how `app/profile/page.tsx` shows them.
- **Badge confirmation and persistence after logging in again (PROG-10, PROG-11) and XP persistence (PROG-07).** These still need manual testing in the app.
- **Two submissions at the exact same moment.** This needs two database connections at once, which a single pgTAP file can't do (see the double-XP issue below).

## 6. Issues found

| Issue | Detail | Suggested fix |
|---|---|---|
| Possible double XP | `submit_quiz()` doesn't lock the learner's `module_progress` row, unlike `record_daily_solve()`. Two passing submissions sent at the same moment (e.g. a double-click) could both count as the first pass and both award XP. | Add `for update` to the `module_progress` select in a new migration. |
| Typo in error message | The trigger says "last **challange** date". | Fix the spelling and update the matching test. |
| Best streak not shown | `best_streak` is stored but the profile page doesn't display it. | Add it to the profile stats. |

## 7. Adding more tests

- Add `.sql` files to `my-app/supabase/tests/database/`. `npm run test:db` runs every file there.
- Each file starts with `begin;` and `select plan(N);`, and ends with `select * from finish(); rollback;`. **N must equal the number of assertions** in the file, or the run fails.
- If you add a migration that changes these functions, run `npx supabase db reset` first so the local database picks up the new migration.
