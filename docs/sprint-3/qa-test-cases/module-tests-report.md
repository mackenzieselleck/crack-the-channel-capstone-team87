# Crack the Channel – Sprint 3 Learning Modules & Badges Automated Test Cases

| Field | Detail |
| --- | --- |
| **Team** | Team 87 - IBM Cyber Security: Quantum Risks |
| **Client** | IBM via RMIT Capstone Consultancy |
| **Project** | Crack the Channel - Interactive QKD (BB84) Learning Platform |
| **Prepared by** | Mackenzie Selleck |
| **Document Status** | Sprint 3: Learning modules and badges automated test cases - unit tests and database tests executed |

## 1. Purpose

This document records the automated test coverage built for the learning modules (the module list, reading pages, progress tracking and the final assessment) and the achievement badge unlock popup.


## 2. Testing Scope

**In scope (automated):**

- The progress model: percentage complete, resume position, module status and overall course progress (`lib/learning/progress.ts`)
- Loading the module, saving progress, module navigation and submission (`useModule` hook)
- Page loading, error handling, reading, pathway and assessment views (`ModuleShell`)
- Answering, submitting, results and retry for final assessment (`Quiz`)
- The module list: published modules, status, next action and parts read (`/learn` page)
- The module route (`/learn/[slug]` page)
- The badge unlock popup (`BadgeUnlockProvider`)
- Database rules for progress and grading: the reading gate, the pass mark, XP on first pass only, and access rules

**Out of scope (not automated by this suite):**

- End-to-end browser tests of the learning journey
- The badge award rules in the database (`award_badges`) and the profile page's badge display
- The Rive badge animation, which is currently switched off in favour of static images due to export error
- The BB84 simulator and the Daily Challenge

## 3. Environment / Assumptions

**Test environment:**

- **Unit tests:** Vitest (`unit` project). Component and hook tests run in jsdom and the progress model runs in Node. The Supabase client, Next.js navigation and links, the auth guard and, for the module page, the `useModule` hook are mocked.
- **Database tests:** Vitest (`db` project) against a local Supabase instance in Docker, with every migration applied. Each test runs inside a transaction that is rolled back. 


## 4. Test Cases

### 4.1 Unit Test Cases

Executed 28 October 2026: 86 tests across 7 files, all passed.

| ID | Test Case | Scenario | Expected Result | Status |
| --- | --- | --- | --- | --- |
| MOD-U-01 | Progress - percentage complete | Calculate progress for 0, 2 and 4 of 4 pages read, with and without a passed test, and for 2 of 2 pages read | Pages and the test count as N + 1 units: 0%, 40%, 80%, 100% after passing, and 67% for 2 of 2 read | Pass |
| MOD-U-02 | Progress - edge cases | Progress greater than the page count, and a module with no pages | Never exceeds 100%; a module with no pages is 0% until passed, then 100% | Pass |
| MOD-U-03 | Progress - resume position | Open a module with no progress, part-read, fully read, and with no pages | Starts on page 1, resumes at the first unread page, or goes straight to the test | Pass |
| MOD-U-04 | Progress - module status | Evaluate status with no reading, some reading, and a passed test | Not started, in progress, or completed as appropriate | Pass |
| MOD-U-05 | Progress - course total | Calculate course progress for no modules, a mix, and all passed | 0% for no modules; weighted by each module's units; 100% when all are passed | Pass |
| MOD-U-06 | Module - load | Open a module by its slug | Module, pages and questions are loaded and mapped, with pages and questions in position order | Pass |
| MOD-U-07 | Module - resume on load | Open a module with saved progress, including a previous pass | Lands on the first unfinished step with the saved progress shown; a passed module shows 100% | Pass |
| MOD-U-08 | Module - load failure | Open a module that is missing or unpublished | Error message shown; no progress is requested | Pass |
| MOD-U-09 | Module - save progress on Next | Press Next on an unread page, and on the last page | Progress is saved with the module and page, then moves to the next page or the test | Pass |
| MOD-U-10 | Module - navigation | Revisit pages already read, press Next on the test, and press Back from various positions | No duplicate save for pages already read; Next does nothing on the test; Back moves one page at a time and does nothing on page 1 | Pass |
| MOD-U-11 | Module - save failure | Saving progress fails, then succeeds on retry | Stays on the page with an error; the error clears after the next successful save | Pass |
| MOD-U-12 | Module - submit test | Submit a passing, a failing, and a worse retake after a pass | A pass marks the module passed with its best score and completion date; a fail does not; a worse retake keeps the earlier pass and best score | Pass |
| MOD-U-13 | Module - submit failure and retry | Submitting fails; retry after a result; Back from a result | Error shown and no result; retry and Back both clear the previous result | Pass |
| MOD-U-14 | Module page - loading and errors | Render while loading, after a load error, and with no error text | Skeleton while loading; error message with a link back to `/learn`; a default message when none is given | Pass |
| MOD-U-15 | Module page - header | Render a module with and without a summary | Title, summary when present, pass mark and progress bar shown | Pass |
| MOD-U-16 | Module page - reading view | Render reading pages at the first, a middle and the last position, and while saving | Shows "Part x of y" with the page content; Back disabled on page 1; last page offers "Continue to assessment"; Continue disabled showing "Saving..." while saving; a save error shows without hiding the content | Pass |
| MOD-U-17 | Module page - pathway sidebar | Render with parts read, current and ahead, at the test, and after passing | Parts ahead and the assessment are locked; the current part shows its number; the assessment unlocks when current and shows complete once passed | Pass |
| MOD-U-18 | Module page - assessment view | Render the module at the test | Assessment shown instead of a reading page; Continue hidden, Back available; answers are passed through for grading | Pass |
| MOD-U-19 | Quiz - no questions | Render the test for a module with no questions | "Test coming soon" placeholder shown | Pass |
| MOD-U-20 | Quiz - answering and submitting | Answer one question, then all, then submit | Submit stays disabled until every question is answered; the chosen option for each question is submitted | Pass |
| MOD-U-21 | Quiz - pass result | Show a first pass, and a retake pass that awards no XP | Score and XP shown with no retry; the reward card is hidden when no XP is awarded | Pass |
| MOD-U-22 | Quiz - fail and retry | Show a failed result, then retry | Feedback with explanations shown; Try again starts a fresh attempt with answers cleared | Pass |
| MOD-U-23 | Module list - data | Load the learning page | Only published modules are requested, in order, with progress for the signed-in learner only | Pass |
| MOD-U-24 | Module list - status and actions | Show completed, in-progress and not-started modules | "Completed" with best score and Review; "In progress" with Continue; "Not started" with Start; completed count shown | Pass |
| MOD-U-25 | Module list - details and empty state | Progress beyond a module's page count; card links; no modules | Parts read never exceeds the page count; each card links to `/learn/<slug>`; empty state shown when there are no modules | Pass |
| MOD-U-26 | Module route | Open `/learn/<slug>` | The module page is rendered for the slug in the URL | Pass |
| BADGE-U-01 | Badge popup - showing badges | A learner has unseen badges | The popup shows each badge's title and description, one at a time, in the order earned | Pass |
| BADGE-U-02 | Badge popup - dismissing | Dismiss with Continue, Escape or a click outside | The popup closes and the badge is marked as seen so it doesn't return | Pass |
| BADGE-U-03 | Badge popup - updates and failures | A badge is awarded on the current page, the route changes, or the badge query fails | New badges appear without a reload; a dismissed badge is never shown again; a failed query shows nothing and the page still works | Pass |

### 4.2 Database Test Cases

Executed 28 October 2026 against local Supabase: 13 tests across 2 files, all passed.

| ID | Test Case | Scenario | Expected Result | Status |
| --- | --- | --- | --- | --- |
| MOD-D-01 | Reading - first page | Learner presses Next on page 1 | One page recorded as read | Pass |
| MOD-D-02 | Reading - no skipping ahead | Learner tries to record page 3 after reading only page 1 | Rejected with "cannot skip ahead" | Pass |
| MOD-D-03 | Reading - going back | Learner reads 3 pages, then revisits page 1 | Progress stays at 3 pages | Pass |
| MOD-D-04 | Reading - invalid page | Record a page before the first or after the last | Rejected with "invalid page index" | Pass |
| MOD-D-05 | Reading - unpublished module | Record progress on an unpublished module | Rejected with "module not available" | Pass |
| MOD-D-06 | Reading - tampering | Learner edits their own progress row directly to mark the module passed | Progress is unchanged | Pass |
| MOD-D-07 | Test - reading gate | Learner submits the test before finishing the reading | Rejected with "finish the reading before taking the test" | Pass |
| MOD-D-08 | Test - pass mark | Submit one correct answer short of the pass mark, then exactly at it | Fails below the pass mark; passes at exactly 70% | Pass |
| MOD-D-09 | Test - unanswered questions | Submit with no answers | Scored 0% and not passed, with no error | Pass |
| MOD-D-10 | Test - retake after passing | Pass, then submit a worse attempt | The pass, best score and completion date are kept | Pass |
| MOD-D-11 | Test - XP | Pass the test twice | XP awarded on the first pass only | Pass |
| MOD-D-12 | Security - answer keys | A learner queries the answer keys | No rows returned | Pass |
| MOD-D-13 | Security - logged-out content | A logged-out visitor queries modules, pages, questions and answer keys | No rows returned | Pass |
| MOD-D-14 | Security - logged-out functions | A logged-out visitor calls the progress and test functions | Permission denied | Pass |

## 5. Traceability

| Requirement | Automated coverage | Coverage status |
| --- | --- | --- |
| Learning modules: segmented reading with saved progress | MOD-U-03, MOD-U-06 to MOD-U-11, MOD-U-14 to MOD-U-17, MOD-D-01 to MOD-D-06 | Automated |
| Learning modules: progress bar | MOD-U-01, MOD-U-02, MOD-U-05, MOD-U-15, MOD-U-24 | Automated |
| Learning modules: final test with 70% pass mark | MOD-U-12, MOD-U-13, MOD-U-18 to MOD-U-22, MOD-D-07 to MOD-D-10 | Automated  |
| Learning modules: module list | MOD-U-04, MOD-U-23 to MOD-U-26 | Automated |
| FR-19 Learning points (XP) | MOD-U-21, MOD-D-11 | Automated  |
| FR-20 Badges and achievements | BADGE-U-01 to BADGE-U-03 | **Partially automated** - the unlock popup is covered; the award rules and profile badge display are not |
| ADR-014 Rewards enforced server-side only | MOD-D-06, MOD-D-11, MOD-D-12 | Automated |
| Learning content restricted to signed-in users | MOD-U-08, MOD-D-05, MOD-D-13, MOD-D-14 | Automated |

## 6. How to run this suite

Run from `my-app/`. The database tests need Docker Desktop running.

```
npm test                        # unit tests (Vitest, unit project)
npm run test:report             # unit tests with junit/json output under reports/unit

npx supabase start              # start local Supabase (first run downloads the Docker images)
npx supabase db reset           # apply every migration, including the BB84 content pack
npx vitest run --project db     # database tests
```

In CI, the **Unit tests** and **Database tests** jobs run these on every push and pull request
