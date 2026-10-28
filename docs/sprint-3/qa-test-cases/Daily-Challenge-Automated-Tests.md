# Daily Challenge QA: Unit, Browser, Database and Grader Tests

| Item | Recorded preparation run |
|---|---|
| Date | 28 October 2026, Australia/Sydney |
| Application | Crack the Channel |
| Base | `jerome/llm-prompting-bugfixes`, commit `f896ca649235627dea5baf6a58aa706ff93d4366` |
| Daily branch | `jerome/daily-challenge-qa` |
| Full unit suite | **342 passed across 21 files**, including 93 added checks |
| Daily-focused unit suite | **253 passed across 12 files**, reusing 160 checks from the completed LLM work |
| Full Playwright suite | **25 passed, zero failures, zero flaky tests**, two workers and no retries |
| Daily Playwright journeys | **Five passed**, including four additions |
| Python challenge tests | **72 passed**, including 39 additions, using real Qiskit and the real FastAPI router |
| New database suite | **38 assertions passed on native local Supabase PostgreSQL** |
| Other validation | TypeScript, ESLint on the changed TypeScript files and patch whitespace checks passed |

The preparation run is separate from a future run on the committed PR head. The downloadable report bundle records these results and source-file hashes. No commit, push, merge or deployment was performed for this preparation.

## What was added

Paths are relative to the repository root.

| File | Added coverage |
|---|---|
| `my-app/lib/daily-challenge/client.test.ts` | 21 tests: HTTP payloads, no-store requests, offline and rate-limit errors, supported tiers, isolated answer drafts and unavailable storage. |
| `my-app/lib/daily-challenge/progress.test.ts` | 14 tests: attempts remaining, private solution visibility, ownership filters, public columns, streak expiry, previous-day/year/leap-day boundaries. |
| `my-app/lib/supabase/dailyChallenge.test.ts` | 16 tests: actual Melbourne date conversion at summer/winter midnight, both DST transitions, leap day, stable seeds and the Qiskit HTTP helper. |
| `my-app/components/daily-challenge/answerInput.test.tsx` | 29 tests: submission-readiness boundaries and real controls for all seven input kinds, including exact maths, amplitudes, circuit editing, the 20-gate cap, QBER and intercept rates. |
| `my-app/components/daily-challenge/hintPanel.test.tsx` | Five tests: hidden hints, next index, pending-save controls, failure/retry, locked and exhausted hints. |
| `my-app/app/api/challenge/routes.test.ts` | Four added regression cases; the complete file has 42 tests. Failed/missed hint writes must not reveal an unsaved hint; another request's saved progress can be read back. |
| `my-app/app/api/challenge/lifecycleRoutes.test.ts` | Four actual-handler checks: same-day caching, real Melbourne midnight conversion into a new bucket, hub reset, generation outage recovery and cleanup after private-answer persistence fails. |
| `my-app/e2e/dailyChallengeEdges.spec.ts` and `dailyChallengeFixture.ts` | Four browser journeys: three failed attempts, generation/hint/grading recovery, signed-out/invalid-tier access, and a two-gate circuit success fixture. |
| `qiskit-service/app/challenges/test_daily_qa.py` | 28 real-grader checks: the two-qubit identity fixture, nonminimal/equivalent and invalid circuits, exact normalisation expressions, all registered categories/tiers and the scheduler-to-registry contract. |
| `qiskit-service/app/challenges/test_daily_api.py` | 11 in-process HTTP checks: internal-key enforcement, invalid tiers/categories, real generate/grade round trips and invalid-circuit responses. |
| `my-app/supabase/tests/database/daily_challenge_rewards.test.sql` | 38 actual SQL assertions: rewards, minimum XP, consecutive/missed-day streaks, Melbourne solve dates, invalid parameters, role permissions, daily/attempt uniqueness and private answer/hint access. |

Existing LLM route/type/budget tests and the original successful-retry browser journey are reused, not copied into another suite. Python's existing 33 challenge tests also run alongside the additions.

## Defects reproduced and changes made

### DC-FIX-01: a hint could be revealed without saving its cost

The hint route ignored an update error and used `revealed + 1` when no updated row was returned. Regression checks reproduced a successful response containing an unsaved hint. A failed read was also presented as a missing challenge.

The route now returns a retryable 503 for a failed read/save. If a conditional update loses a race, it reads back persisted progress. It returns only confirmed hints, or a 409 asking for another reveal attempt when progress did not advance. The new tests use deterministic conflict fixtures; they do not prove independent-connection concurrency safety.

### DC-FIX-02: empty circuit tokens crashed the grader

Real Qiskit tests showed `""` and whitespace tokens raised an uncaught `IndexError`. The circuit builder now rejects an empty token with `ValueError`, which its existing grader turns into `invalid_circuit`. Both direct grading and FastAPI HTTP checks verify that malformed circuits return a controlled incorrect grade.

### DC-FIX-03: an unavailable category could be scheduled

Next.js listed `state_evolution` among scheduled Python categories, but the real registry contains only `bb84_eve`, `sifting`, `normalisation` and `gate_simplification`. The state-evolution file currently contains parser code and registers no generator. Requests for that category return an unknown-type error.

The scheduler now selects only implemented Python categories. A cross-service test compares its static export with the actual registry, so registry-based parametrisation cannot silently skip an advertised category. **State Evolution generation is still unimplemented.** Its existing UI/types are retained and its controls are tested, but this package does not claim that feature works through a live generated challenge. Already-stored unsupported challenges are not repaired by this scheduling change.

## Relationship to the earlier manual QA

The earlier Learning/Daily report recorded seven Daily cases passed, two partial and one blocked. That historical result is unchanged. These repeatable checks add evidence at specific layers:

| Manual case | New or reused evidence | Practical limit |
|---|---|---|
| DC-01: three-tier hub | Existing successful browser journey, new lifecycle status checks | Browser status API is simulated. |
| DC-02: challenge generation | Real Python generation/grade tests and actual Next route tests | Separate layers, not a live Next-to-Qiskit deployment. |
| DC-03: hints and refresh | Hint unit/route tests, failure fix, existing browser persistence fixture | No real PostgREST/realtime delivery or restart test. |
| DC-04: wrong answer | Actual graders and browser/route checks | Browser grading is simulated. |
| DC-05: three attempts | New exhaustion journey, existing submit guards, real uniqueness constraints | No multi-connection load or retry storm test. |
| DC-06: rewards and streak | Native pgTAP, XP unit fixtures and browser reward display | Browser reward response is simulated. |
| DC-07: reopening | Browser refresh and session-storage tests | Does not establish live logout/login persistence or database durability across restart. |
| DC-08: input formats/minimal circuit | All seven controls, real two-gate Qiskit identity and browser circuit submission | The unrecorded historical instance was not replayed. State Evolution generation remains unavailable. |
| DC-09: midnight rollover | Real Melbourne date helper across midnight/DST; actual handlers with simulated storage; real SQL streak rules | No real-time observation across midnight with the entire stack connected. |
| DC-10: invalid access/service failure | Browser recovery, actual handler guards, HTTP client and FastAPI checks | No live network outage/recovery deployment test. |

Learning module QA is outside this Daily-only package.

## Run unit tests and save reports

Use Node.js 22. From `my-app/`:

```powershell
npm ci
npm run test:daily:report
npm run test:report -- --project unit
npx tsc --noEmit
```

On the recorded base, focused Daily coverage is 253 tests and the full unit total is 342. Other merged test PRs can increase the totals. Both report commands write `reports/unit/results.json` and `reports/unit/junit.xml`; the later command replaces the earlier reports. Preserve a copy between commands if retaining both scopes. The prepared download contains both under separate folders.

## Run the browser journeys

From `my-app/`:

```powershell
npx playwright install chromium
npm run test:daily:e2e
npx playwright test --workers=2
npx playwright show-report reports/e2e/html
```

The first test command selects all five Daily journeys; the full recorded suite contains 25 tests. The existing configuration starts the local app and simulated Supabase authentication. The new journeys also simulate challenge API, grading and persistence responses. Each new journey has bounded page waits and a 90-second overall cap for cold development-server compilation. No fixed sleeps or skipped assertions are used.

The preparation run used local Chrome through the existing `PW_CHROMIUM_PATH` option, with `CI=true`, two workers and retries disabled. CI installs Linux Chromium; its first hosted run remains a separate check. Browser reports are HTML, JSON and JUnit under `reports/e2e/`.

## Run real Python grading/API tests

Use Python 3.13, as in preparation. From `qiskit-service/`:

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest app/challenges -q --junitxml=reports/daily-challenge.xml
```

Expected on the recorded base: 72 passing tests. Qiskit 2.5.2, Aer 0.17.2 and the documented service dependencies are used. FastAPI TestClient uses an in-process HTTP transport; it does not start a standalone service. The existing dependency set emits one non-failing Starlette/httpx deprecation warning. Resolved preparation versions are included in the report bundle.

## Run the database suite and retain its log

Docker Desktop must be running. From `my-app/`, with the current migrations in a disposable local instance:

```powershell
npx supabase start
New-Item -ItemType Directory -Force reports/database | Out-Null
npx supabase test db supabase/tests/database/daily_challenge_rewards.test.sql 2>&1 | Tee-Object -FilePath reports/database/daily-challenge.log
```

Expected: 38 passing assertions and `Result: PASS`. Inspect the native command's exit code as well as the log. The preparation run used the already-running local Supabase database, verified all 18 migration versions, and confirmed zero fixture users remained after rollback. It did not reset or stop that shared instance. A separate disposable PGlite run of the same SQL also passed, but the native result above is the stronger integration evidence.

Current source stores SQL under `supabase/tests/database/`. Pipeline PR #48 moves it to `supabase/tests/db/`. Use that moved path after integration and keep one copy of the suite. The separate badge fixture corrections must be integrated before expecting all repository SQL suites to pass; this result covers the new Daily suite, not a fresh full-SQL-suite run.

## CI and report handling

The existing Vitest and Playwright discovery rules include these new test files without extra configuration. Python grading and pgTAP require their own CI jobs. The separately prepared `Daily-Challenge-CI.patch` adds those jobs to the recorded PR #48 workflow, enables unit report artifacts, and retains Playwright reports for successful and failed runs. It preserves main-only deployment and adds the new jobs as deployment dependencies.

That workflow patch was parsed and checked locally. It has not run on GitHub and does not change branch protection. Coordinate its integration with the pipeline owner; do not add duplicate workflow files or overwrite their newer workflow.

Source tests and this document belong in Git. Generated reports, logs, local Python environments, bytecode and browser caches remain ignored. Upload reports as CI artifacts or attach the prepared report ZIP to the PR for review.

## Remaining limits

- Browser API interception, handler fixtures, native SQL and real graders establish different layers. Together they are not a live full-stack E2E run with a real model/provider and production-like network transport.
- State Evolution generation remains unimplemented and is excluded from new scheduling.
- Independent-connection concurrency, repeated reward recovery after a failed reward RPC, process-restart durability and live clock rollover remain unverified. A passing unique-constraint check does not prove that every reward race is safe.
- The shared LLM deadline does not bound database/Qiskit I/O. Production latency, availability and semantic model quality are not established here.
- The prior manual screenshots and module-content findings are not recreated or reclassified as passed by this package. No production accounts, provider calls, deployment or release sign-off are included.
