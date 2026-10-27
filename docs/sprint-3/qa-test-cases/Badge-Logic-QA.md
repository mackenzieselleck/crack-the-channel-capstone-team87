# Badge Logic QA Tests

This report records my review of the badge logic, including award rules, XP, streaks, persistence, access controls and popup behaviour. I have separated the confirmed findings from areas that still need further testing.

| | |
|---|---|
| **Test date** | 26 October 2026 (Australia/Sydney) |
| **Application** | Crack the Channel |
| **Repository** | `mackenzieselleck/crack-the-channel-capstone-team87` |
| **Branch tested** | `main` - `51f826450e2f3cff078029dfd60d717ebd2564c9` |
| **Run with** | Disposable PGlite PostgreSQL; Chrome component harness; repository test results |
| **Custom checks** | 24 database checks passed; Chrome component checks: 5 passed, 2 failed |
| **Outcome** | **Core badge rules pass isolated functional checks. Two popup defects reproduced. Qualified result, not full deployment sign-off.** |
| **Related test docs** | `Learning-Daily-Challenge-Manual-QA.md` |

Remote main was checked again after testing and still matched the recorded commit.

## 1. Scope of the review

I have assessed the database rules and popup behaviour separately because they were checked in different environments. The database results use the actual PL/pgSQL functions in a disposable database. The popup results use the actual source components with simulated services and storage. The Playwright results cover the localhost application with the repository mock backend.

**Scope limitation:** I would not treat these results as full E2E badge integration coverage with real Supabase. The database, component and browser checks have the boundaries described above. A check that confirms a defect can pass its reproduction criteria while the product behaviour remains defective.

## 2. How to run follow-up tests

Use an isolated test copy and disposable database, record the exact commit and document setup changes. The custom harness commands and check-by-check scripts are not included here, so this report is not a complete reproduction guide. Existing suite commands and setup qualifications appear in section 6. Before release approval, run real local Supabase integration and concurrent first-pass tests using independent PostgreSQL connections.

## 3. How the tests were performed

The existing local workspace was at `C:\Users\User\OneDrive\Documents\Crack-The-Channel\crack-the-channel-capstone-team87`. Its HEAD was `667653a`, behind the requested main branch. QA used an isolated fresh clone. The existing workspace was not changed. No production accounts, application secrets, or live Supabase project were used.

All 18 repository migrations applied unchanged in disposable PGlite PostgreSQL, with minimal Supabase auth-schema, role, and identity-function emulation. Tests executed the actual PL/pgSQL award and quiz functions.

Fresh migrations create five **unpublished** modules. For completion-path tests only, those modules were published in the disposable database. This blocks module earning on a fresh installation if immediate learner access is expected. Confirm whether separate publication is intentional; this does not establish production's publication state.

Chrome tested the actual `BadgeUnlockProvider` and `BadgeArt` source components. Supabase responses, realtime notifications, and dismissal storage were simulated at the component boundary. The harness used minimal styling: the accompanying screenshot demonstrates image loading and content, not production layout. The existing Playwright suite separately exercised the real Next.js app using its repository-provided mock backend.

## 4. What was tested

### 4.1 Badge rules, persistence and static assets

**24 custom database checks passed**, with related assertions grouped into checks.

| Area | Verified result |
| --- | --- |
| Eligibility | New learners receive no badges; null/missing profiles safely return no awards. |
| Reading prerequisite | Quiz submission is rejected before reading is complete. |
| Passing threshold | 60% fails with no badge or XP; exactly 70% passes. |
| Module badges | Each of the five module passes grants its corresponding badge. |
| Champion | Fifth module completion also grants Overall Champion in the same call; earlier completions do not. |
| Duplicate prevention | Repeated award calls and sequential retakes return no new badges. The primary key prevents duplicate user/badge rows. |
| Module XP | First pass grants the configured reward; sequential repeat grants zero. Failure after passing preserves the earned badge and passed state. |
| Daily badge | First daily solve grants Daily Challenge and 50 XP for tier 1, no hints, attempt 1. |
| Streak | Best streak 6 does not qualify; seventh consecutive day grants Consistency Master. A missed day preserves the badge and best streak while resetting current streak. |
| Daily XP | Tier 2, two hints, attempt 2 grants 65 XP; minimum-reward case grants 10 XP. |
| Persistence | Earned rows remain across transactions; own dismissal saves `seen_at` and is idempotent. |
| Access controls | Authenticated learners cannot call `award_badges`, forge badges, read another learner's badges, or dismiss them. |
| Invalid rule | `streak:seven` is ignored safely. |
| Static assets | All eight catalogue PNG files exist with valid PNG signatures. |

### 4.2 Chrome component checks

**Chrome component checks: 5 passed, 2 failed.** Passing checks cover a loaded static PNG with no Rive/WASM request, queue deduplication under repeated notifications, successful dismissal persistence across refresh, Escape dismissal, and reproduction of the failed-dismissal refresh problem. Some checks contain multiple assertions.

## 5. Issues and observations

**Confirmed badge defects: 2, both medium severity.**

### 5.1 B-01: Failed dismissal is silently treated as successful - medium

Location: `my-app/components/badges/badgeUnlockProvider.tsx`, `dismiss` callback.

Steps: Open an unseen badge; make `mark_badges_seen` return an error; click Continue; refresh.

Actual: The badge disappears with no error or retry. Refresh shows that same badge again because `seen_at` was never saved. The component changes its dismissed set and queue before the request and ignores the returned error.

Expected: Handle save failures with retry or clear feedback and retain retryable state. This affects notification persistence; it does not delete the earned badge.

### 5.2 B-02: Keyboard focus escapes the modal - medium

Location: `my-app/components/badges/badgeUnlockProvider.tsx`, `BadgeUnlockDialog`.

Steps: Open a popup and press Tab repeatedly.

Actual: Focus reaches background content despite `aria-modal="true"`. Initial button focus and Escape work, but there is no focus containment or background inertness.

Expected: Contain keyboard focus, make background content inactive, and restore appropriate focus on close.

## 6. Supporting repository test results

| Run | Result | Interpretation |
| --- | --- | --- |
| `npm test`, untouched checkout | 8 suites fail before tests run | Configured `tests/setup.ts` is missing from main. |
| Unit suite with QA-only setup restoration | 81 passed, 1 failed / 82 | Added only the jest-dom setup import in the disposable copy. This is not a clean-main pass. |
| Existing Playwright suite, installed Chrome | 19 passed, 1 failed / 20 | Localhost app and repository mock Supabase backend. |
| `npx tsc --noEmit` | Passed | After QA setup restoration, with generated Next.js types available. |

The unit failure at `app/(protected)/learn/[slug]/page.test.tsx:119` expects the learning element at `layout.props.children[1]`; the badge-provider wrapper changes the layout shape. This is a stale assertion, not evidence of inaccessible learning content.

The browser failure at `e2e/signupLogin.spec.ts:51` expects “Unable to create account. Please try again.” but receives “User already exists. Please try logging in instead.” This is separate from badges.

The checked-in pgTAP suite was inspected but not executed because Docker/PostgreSQL tooling was unavailable. It contains stale fixtures/expectations: its fixture badge has no slug, while current awarding requires one, and daily-solve expectations omit `badgesAwarded`. Update it before using it as a regression gate.

## 7. What remains unverified

- Real Supabase/PostgREST/realtime integration for badges remains unverified, including publication delivery, API schema cache, reconnects, and sign-out/sign-in persistence.
- Database persistence was checked across transactions; browser refresh used simulated storage. Database process restart was not tested.
- Concurrent first-pass XP is an **unverified race risk**: `submit_quiz` reads `completed_at` without locking before deciding whether XP is due. Two overlapping requests could both qualify even though badge uniqueness prevents duplicate badge rows. Verify with independent PostgreSQL connections.
- Daily submission records a successful attempt separately from reward processing. If reward processing fails, retries can be blocked as already solved. This is an **inspected failure-recovery risk**, not an injected full-route result.
- Rive was intentionally excluded and is not counted as defective. Missing/corrupt PNG recovery and production styling were not verified.
- No application fixes, commits, pushes, or issues were created. The original workspace was untouched.

## 8. Recommended next steps

My recommended next steps are:

1. Fix dismissal error handling and modal focus, then repeat the affected checks.
2. Restore the missing test setup and update the stale repository tests.
3. Confirm whether the five modules are intended to remain unpublished after migration.
4. Verify badge integration against real local Supabase, including realtime delivery and persistence.
5. Check concurrent first-pass XP using independent PostgreSQL connections before release approval.

### Final status

| Status | Checks / findings |
|---|---|
| **PASS - isolated database checks (24)** | Related assertions grouped into checks; the results table groups areas rather than listing 24 individual cases |
| **Chrome component checks (7)** | **5 passed, 2 failed**; simulated service and storage boundaries; some checks contain multiple assertions |
| **CONFIRMED BADGE DEFECTS (2)** | B-01 dismissal error handling; B-02 modal focus escape; both medium severity |
| **UNIT SUITE - untouched checkout** | **8 suites fail before tests run** due to missing setup |
| **UNIT SUITE - QA-only setup restoration (82)** | **81 passed, 1 failed**; not a clean-main pass |
| **PLAYWRIGHT - mock backend (20)** | **19 passed, 1 failed**; localhost app with repository mock Supabase backend |
| **TYPE CHECK** | Passed after QA setup restoration, with generated Next.js types available |
| **NOT EXECUTED** | Checked-in pgTAP suite; Docker/PostgreSQL tooling unavailable |
| **RELEASE SIGN-OFF** | **Not established**; integration, concurrency and other stated limitations remain |

**Conclusion:** My assessment is that the core badge rules are supported by the isolated functional results, but the two popup defects need fixing. I would not give release approval until the outstanding integration checks and risks have been addressed. The simulated services and storage, setup changes and other limitations above remain part of this result.
