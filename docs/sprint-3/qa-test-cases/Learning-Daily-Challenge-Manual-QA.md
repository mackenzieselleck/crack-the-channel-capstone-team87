# Learning Module and Daily Challenge Manual QA Tests

Manual browser tests of the Learning Module and Daily Challenge user journeys, including progress, assessment, XP, streaks, persistence and error handling.

| | |
|---|---|
| **Test date** | 25 October 2026 (Melbourne time) |
| **Application** | Crack the Channel, Next.js local development website |
| **Repository** | `mackenzieselleck/crack-the-channel-capstone-team87` |
| **Branch tested** | Local `main` (exact commit SHA not recorded) |
| **Run with** | `npm run dev` from `my-app/`; manual checks in desktop browser |
| **Test cases** | 18: MOD-01–MOD-08 and DC-01–DC-10 |
| **Outcome** | **15 passed, 2 partially verified, 1 blocked, 0 confirmed failures** |
| **Related test docs** | `docs/sprint-2/qa-test-cases/Sprint-2-QA-Test-Cases.md` |

## 1. Why these are manual tests

Learning and Daily Challenge functions involve browser navigation, interactive questions, persisted progress and server-generated content. This session verified the *visible end-to-end behaviour* using test accounts, rather than only checking that individual database functions pass automated tests.

| Feature | What manual QA verifies | Backend involvement |
|---|---|---|
| Learning modules | Sequential content, locked sections, progress, assessment, retries | Supabase module progress and quiz grading |
| Profile rewards | First-pass XP, completion persistence and duplicate-XP prevention; badges deferred | Supabase gamification functions |
| Daily Challenge | Generated tasks, three tiers, hints, answers, graded results | Challenge APIs and Qiskit microservice |
| Daily rewards | XP deductions and daily streak changes | Server-side rewards and persistence |
| Error handling | Invalid tier, unauthenticated access, recovery of simulator connection | Protected routes and microservice |

**Important distinction:** The Qiskit outage/recovery check was performed in the **BB84 Simulator**, not in Daily Challenge generation. It supports a Simulator robustness claim only. Database-level concurrency, API validation and the accuracy of newly published educational material require additional tests.

## 2. How to run the tests

**You need:** A running copy of the application with valid local environment configuration, an onboarded account, a separate new test account for first-use module progression, and a reachable Qiskit microservice.

From a terminal in `my-app/`:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000` in a desktop browser, sign in and follow the cases below. Record a screenshot for each meaningful transition. For a reproducible future run, record the exact Git commit using `git rev-parse HEAD` before testing.

**Do not commit or disclose** `.env.local`, `INTERNAL_API_KEY`, Supabase secret keys or session tokens. Do not manipulate the production database or system clock to force a date reset.

## 3. How the tests were performed

- An account that had already completed the Placeholder Module was used for module review and failure/retry checks. MOD-07 and MOD-08 were verified against the published **Module 2 — Bases, Normalisation and Quantum Circuits**, using its first successful completion and a subsequent assessment attempt.
- For sequential reading and resume checks, a separate account began the Placeholder Module at **0/4 sections** and progressed through to completion. For MOD-07 and MOD-08, the Module 2 account began at **300 XP**, **0 badges** and **0/5 sections** in Module 2, then completed the assessment and checked profile persistence.
- Tier 1 generated **“Is Eve listening?”** (eavesdropper detection); Tier 2 generated **“Make it add up”** (normalisation); Tier 3 generated **“Fewer gates, same job”** (gate simplification).
- Results were verified through successive screenshots and tester observations. The full source screenshots were submitted during the guided session; filenames in this report are evidence references, **not image attachments embedded here**.
- The Daily Challenge date rollover could not be tested during the session and was marked **Blocked**, not passed or failed.

## 4. What was tested

### 4.1 Learning Module navigation and assessment

| QA case | Scenario | Observed outcome | Status |
|---|---|---|---|
| MOD-01 | Learning hub displays available modules and status | Module card, reading progress, pass mark and action rendered | **PASS** |
| MOD-02 | Open module | Title, reading content, pathway, progress and navigation rendered | **PASS** |
| MOD-03 | Complete reading sections in sequence | Progress advanced **0% → 20% → 40% → 60% → 80%**; assessment unlocked after fourth section | **PASS** |
| MOD-04 | Refresh and log in again mid-module | Part 2 resumed at **20%**, with Part 1 completed and later sections locked | **PASS** |
| MOD-05 | Leave assessment incomplete | Submit disabled at **0/3** and **1/3**, enabled at **3/3** | **PASS** |
| MOD-06 | Fail and retry assessment | **33%** score, explanation per question, Try again reset answers | **PASS** |
| MOD-07 | First successful completion using published Module 2 | Five sections completed; final assessment scored **100% (10/10)** against 70% pass requirement; **+100 XP**, Profile total **300 → 400 XP**. Badge awarding is outside scope, pending integration. | **PASS** |
| MOD-08 | Completed Module 2 persistence and duplicate-XP prevention | Hub showed **2 of 5 modules completed**, Module 2 **Completed · 100%**, **5/5 parts read**, and Review after refresh and after logout/login. A passing **100% (10/10)** assessment retake left Profile XP at **400** (no duplicate +100 XP). Badges deferred. | **PASS** |

**Learning evidence examples (MOD-01–MOD-06):** `image(20261025-070400).png` (20% progress), `image(20261025-071117).png` (80% and assessment unlocked); additional screenshots and tester confirmations document the failure/retry flow.

**Module 2 evidence (MOD-07 and MOD-08):** `image(20261025-081925).png` (Module 2 not started, 0/5 sections); `image(20261025-082000).png` (Profile baseline 300 XP, 0 badges); `image(20261025-082138).png` (5/5 reading sections, 83% progress and assessment unlocked); `image(20261025-082240).png` (10/10 answers selected, Submit enabled); `image(20261025-082511).png` (100% score and +100 XP); `image(20261025-082622).png` (Profile 400 XP); `image(20261025-082814).png` (Module 2 completed after refresh); `image(20261025-083103).png` (100% passing retake, no reward message); `image(20261025-083153).png` (Profile still 400 XP); `image(20261025-083310).png` (2/5 completed after logout/login).

**Badge scope:** The teammate responsible for badge integration reported that badges are **not yet connected** and will be tested separately. For these cases badge awarding, badge persistence and duplicate-badge prevention are **deferred**, not passed or failed. The observed `0 badges` does not establish a defect in the current scope.

### 4.2 Daily Challenge availability, questions and persistence

| QA case | Scenario | Observed outcome | Status |
|---|---|---|---|
| DC-01 | Open daily hub | Three tiers, **50/100/150 XP** maxima, streak and XP tiles rendered | **PASS** |
| DC-02 | Generate challenge | Tier 1 BB84 question, 11% threshold, Alice/Bob data, controls, hints and attempts displayed | **PASS** |
| DC-03 | Reveal and refresh hint | Hint 1 persisted; usage **1/3**, potential XP **50 → 40** | **PASS** |
| DC-04 | Submit wrong decision | Incorrect result, relevant QBER feedback, **2 attempts left** | **PASS** |
| DC-05 | Exhaust three attempts | Challenge closed, retry removed, worked solution unlocked (0/14 mismatches; QBER 0%) | **PASS** |
| DC-06 | Solve challenge and verify rewards | Tier 2 accepted `1/sqrt(3)` on first attempt; **+100 XP**, **1-day streak**; Profile **100 → 200 XP** | **PASS** |
| DC-07 | Reopen same-day challenge | Title, threshold, hint, XP and attempts unchanged; tier results persisted through login | **PASS** |
| DC-08 | Test tiers and input types | Decision, math and circuit-builder UIs worked; gates, Undo, Clear, hints and submissions exercised; shortest-circuit success **not** verified | **PARTIAL** |
| DC-09 | Reset at Melbourne midnight | Could not execute across a date boundary | **BLOCKED** |
| DC-10 | Invalid access and service failure | Invalid Tier 4 controlled error; logged-out Tier 1 redirected to login; results persisted. Simulator outage/recovery passed separately. Daily Challenge-specific failures not exercised | **PARTIAL** |

**Daily Challenge evidence examples:** `image(20261025-071612).png` (hub), `image(20261025-071746).png` (Tier 1), `image(20261025-071914).png` (hint persisted), `image(20261025-072615).png` (attempt limit), `image(20261025-072751).png` (Tier 2 solved), `image(20261025-072843).png` (Profile XP/streak), `image(20261025-073129).png` (Tier 3), `image(20261025-075223).png` (equivalent but nonminimal circuit), `image(20261025-075312).png` (invalid tier), `image(20261025-075350).png` (login redirect), `image(20261025-080042).png` (Simulator outage), `image(20261025-080308).png` (Simulator recovered).

### 4.3 Daily Challenge XP and state observations

The UI displayed these reward rules: tier base XP of **50 × tier**, minus **10 per revealed hint** and **15 per additional attempt**, with a **minimum of 10 XP** for a correct answer. The tested examples matched that rule:

| Scenario | Expected | Observed |
|---|---:|---:|
| Tier 1 before hints | 50 XP | 50 XP |
| Tier 1 after 1 hint | 40 XP | 40 XP |
| Tier 2 first-attempt success, 0 hints | +100 XP | +100 XP and streak 1 day |
| Tier 3 after 1 failed attempt + 1 hint | 125 XP | 125 XP shown |
| Tier 3 after 2 failed attempts + 2 hints | 100 XP | 100 XP shown |

### 4.4 Circuit simplification result

On Tier 3, the UI accepted placing H, X, Z and CNOT gates, removing an individual gate, and using Undo/Clear. A submitted empty circuit was marked incorrect. A proposed five-gate circuit was also marked incorrect. A **six-gate circuit was reported as equivalent but not minimal**, and the user's final attempt was exhausted. The displayed worked solution was **`CNOT(1→0) → X(q1)` (2 gates)**. Since that exact solution was **not submitted and graded** during this session, DC-08 is not marked fully passed.

## 5. What is not covered

- **Other published learning modules:** MOD-07 and MOD-08 exercised **Module 2 with real content and 10 assessment questions**. MOD-01–MOD-06 were exercised on a Placeholder Module; content accuracy and end-to-end behaviour for Modules 1, 3, 4 and 5 were not comprehensively tested.
- **Badge integration:** Mackenzie confirmed badge connectivity is pending and will test badges separately. First-time badge awards, badge persistence and duplicate-badge prevention are intentionally excluded from the MOD-07/MOD-08 pass determination.
- **Midnight rollover (DC-09):** No observation of a new Melbourne calendar day's tier reset or multi-day streak logic.
- **Daily Challenge errors (DC-10):** No controlled malformed API submissions, expired challenge submissions, or generated-challenge failure caused by an unavailable Qiskit service.
- **Minimum circuit acceptance (DC-08):** The two-gate worked solution was shown but not independently submitted.
- **Security and concurrency:** No simultaneous passes/duplicate-XP race, backend tampering or comprehensive permission testing in this browser session.
- **Reproducibility:** Exact local `main` commit SHA was not captured; screenshots are referenced, not bundled into this Markdown file.

## 6. Issues and observations

| ID | Observation | Assessment | Recommended follow-up |
|---|---|---|---|
| OBS-01 | Hub originally showed **In progress / 0 of 1**, while the module detail displayed **100%**. Refreshing the hub then showed **Completed / 1 of 1**. | **Unconfirmed** transient display/state discrepancy | Recheck client navigation and revalidation after assessment completion. |
| OBS-02 | Earlier placeholder testing displayed a badge, while later Profile views showed **0 badges** after learning content changed. Mackenzie reported that badge integration is not yet connected. | **Deferred integration**, not a confirmed defect in the tested XP/completion flows | Test badge award, display, persistence and duplicate-badge rules separately once the integration is connected. |
| OBS-03 | Tier 3's wording “Find the simplest equivalent” did not explain clearly that a shorter-but-not-minimum equivalent circuit would be rejected. | **UX improvement**, not a proven grading bug | State explicitly that *fewest possible gates* is required. |
| OBS-04 | A 6-gate equivalent was rejected and a 2-gate worked solution shown. | **Expected by minimum-gate rule** | Submit a verified minimal circuit in a new test day/account to complete DC-08. |
| OBS-05 | Temporarily invalid Qiskit URL caused Simulator to show “temporarily unavailable”; the Simulator worked again after restoring the URL. | **Simulator robustness passed**; not Daily Challenge outage coverage | Test Daily Challenge's generation/grade route failures with isolated fixtures or service mocks. |

**Confirmed product failures in this session:** **0**. This is not a claim that the application has no defects.

## 7. Adding more tests and next steps

1. MOD-07 and MOD-08 passed on **published Module 2**. Complete content/assessment QA for Modules 1, 3, 4 and 5, and separately validate learning content quality.
2. On a future Melbourne date or in an isolated clock-controlled environment, verify **DC-09** resets tiers and preserves/breaks streaks according to requirements.
3. Run negative API tests in a **safe test environment** to finish **DC-10**: invalid payloads, expired challenge, microservice timeout, failure recovery, and stable XP after rejection.
4. Reproduce the **two-gate solution** for DC-08 and verify that the grader accepts it; check equivalent mathematical input formats and other generated categories as time permits.
5. Once badge integration is connected, test initial badge awarding, badge display after login, and duplicate-badge prevention as separate acceptance checks.
6. Capture `git rev-parse HEAD`, test-account state, screenshots and the exact environment/version for every future run, then update the result matrix. Keep secrets out of records.

### Final status

| Status | Cases |
|---|---|
| **PASS (15)** | MOD-01–MOD-08; DC-01–DC-07 |
| **PARTIAL (2)** | DC-08; DC-10 |
| **BLOCKED (1)** | DC-09 |
| **CONFIRMED FAIL (0)** | None |

**Conclusion:** Learning progression and assessment mechanics were verified, including the first successful completion and duplicate-XP prevention on published Module 2. Badge integration is deferred. Primary Daily Challenge mechanics functioned as expected in this manual desktop test. The three outstanding Daily Challenge cases must not be counted as fully passed until the missing behaviours are exercised and verified.
