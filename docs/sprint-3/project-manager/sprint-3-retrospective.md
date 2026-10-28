# Sprint 3 Retrospective

| | |
|---|---|
| **Team** | Team 87, Crack the Channel (IBM Cyber Security: Quantum Risks) |
| **Sprint** | Sprint 3, Weeks 7–9 (5–25 October 2026). Final merges ran to 28 October. |
| **Held** | Team meeting, Tuesday 27 October 2026, 5:30 pm |
| **Facilitator** | Thomas Clowes (PM) |
| **Input** | Prepared by the PM. Each member's own reflection is on the final presentation's reflection slides and summarised in Section 7. |

Prepared from GitHub (state of `main` on 28 October 2026), the live Planner board, the CRM, the team chat and the risk and dependency log.

## 1. Sprint goal and result

**Goal (Sprint 3, "Refine MVP"):** add Eve mode with live QBER feedback, integrate the beginner learning content, test the platform, and hand over a client-ready package.

**Result:** the goal was met, except for usability testing with real users, which was not run. All feature and fix work merged to `main` by 28 October; badges, the CI/CD pipeline and the LLM fixes landed after the sprint closed.

| Measure | Sprint 3 |
|---|---|
| Pull requests merged to `main` | 18 (#34 to #56) |
| Automated tests | 102 auth (82 unit, 20 end-to-end), 53 Qiskit service, 55 database (gamification), plus badge, Daily Challenge, LLM prompting and learning-module suites (PRs #49 to #56), all run by CI on every pull request |
| QA and test reports written | 11, in `docs/sprint-3/qa-test-cases/`, `docs/sprint-3/testing/` and `docs/sprint-3/LLM-Prompting-QA.md` |
| Logged effort | 240 minutes per person per week in Sprint 3 (see the hours reconciliation) |

## 2. What we delivered

- **Simulator:** baseline and Eve QBER, short explainer boxes on each BB84 step (Sarah, PR #44), and Continue blocked until each role's choices are complete (PR #52).
- **Daily Quantum Challenges:** full frontend, Groq LLM integration, hints, rate limiting (MacKenzie, PR #36).
- **Learning modules:** beginner content added to the database as a migration, so a rebuild includes it (MacKenzie, 25 October).
- **Gamification:** 8 unlockable badges with an award pop-up (MacKenzie, PR #45), and fixes for dismissal errors and modal focus (Jerome, PR #46).
- **Front end:** frontend foundation, light and dark theme, navbar and dashboard portal (Jerome, PR #39), and badge artwork on the home and auth pages (PR #53).
- **Auth:** reworked flows, password reset, and a fix for already-registered sign-ups (MacKenzie, PR #43). End-to-end auth tests (Sarah, PR #40).
- **Hosting:** Qiskit service deployed to Render (Sarah, 14 October). Domain and Resend email set up (MacKenzie).
- **QA:** BB84 simulator test report, 18 of 22 passed and none failed (Srilekha, PR #41). Learning, Daily Challenge, badge logic and LLM prompting QA reports, LLM fixes (PR #50) and automated Daily Challenge tests (PR #51) (Jerome). Learning-module tests (MacKenzie, PRs #55, #56).
- **CI/CD:** GitHub Actions runs lint, types, unit, database (pgTAP) and end-to-end tests on every pull request and deploys `main` to Vercel (MacKenzie, PR #48).
- **PM:** 55 database tests (PR #34), the risk and dependency log, weekly CRM entries and the Handover Document.

## 3. What went well

- **The Daily Challenge shipped end to end.** It went from backend in Sprint 2 to a full feature with LLM wording, hints, XP and streaks.
- **Work was reassigned instead of dropped.** When Sarah's assignment load peaked in Week 8, MacKenzie took over the gamification work. Badges, which slipped from Sprint 2, are now live.
- **Testing grew from almost nothing to a real safety net.** It now covers more than 200 automated tests and six QA reports. The database tests found a possible double-XP bug before users could hit it.
- **Pull request reviews improved.** In Week 9, PRs were merged by someone other than the author: #43 and #45 by Jerome, #44 by Srilekha, #46 by MacKenzie. This followed the direct pushes to `main` in Week 8 (risk R6).

## 4. What did not go well

- **Planner cards did not always match the work.** In Week 8, the Daily Challenge UI and the AI assistant were planned on cards for the wrong people (risk R7). The cards were rewritten after the fact.
- **Feature work spilled into the testing week.** Week 9 was meant for integration testing and QA. Badges and auth fixes landed on 25–26 October, so the QA on them was compressed. The badge logic and LLM prompting QA reports both came back qualified.
- **No usability testing with real first-year students.** The brief asks for UX that has been usability tested. The design rests on the August survey and team reviews only.
- **CI/CD came on the last day.** It was on cards in Weeks 7 to 9 but was only merged on 28 October. It runs the database tests but not yet the Qiskit service tests.
- **Assignment load from other courses hit the same weeks.** Assignments in Weeks 8–9 reduced capacity, and this wasn't planned for at the start of the sprint.

## 5. Open issues found by QA

| Issue | Source | Severity | Owner for hand-off |
|---|---|---|---|
| LLM answers paraphrased in other words ("25 percent" for 25%) can still pass the string-matching leak check. Title and case leaks were fixed in PR #50. | LLM-Prompting-QA.md | Low | Next team |
| `submit_quiz()` can award XP twice on simultaneous submissions (no row lock) | Profile-Gamification-Tests.md | Medium | Next team |
| Qiskit-service-down handling and repeated runs not tested (SIM-20, SIM-21) | Simulator test report | Medium | Next team |
| Daily Challenge date rollover not tested (blocked) | Learning-Daily-Challenge-Manual-QA.md | Low | Next team |

## 6. Actions

| Action | Owner | When |
|---|---|---|
| Complete the access transfer and key rotation in the hand-off checklist | MacKenzie, Sarah, Tom | Before the semester ends |
| Run a usability pilot with first-year students, or record clearly that it was not done | Jerome | Before the Boot Camp |
| Add the Qiskit service pytest suite to the CI pipeline | Next team | First week of the next phase |
| Fix the `submit_quiz()` double-XP race | Next team | Before the Boot Camp |
| Next time: write Planner cards from agreed scope on day one of the week, and check them against GitHub midweek | PM | Next project |
| Next time: freeze features at the end of the second sprint week and keep the final week for testing | Whole team | Next project |

## 7. Team reflections (one line each, from the final presentation)

| Member | Role | One thing to keep / one thing to change |
|---|---|---|
| Thomas Clowes | PM | Chase dependencies instead of just tracking them, control scope early, and check Planner against GitHub every week. |
| Srilekha Byreddy | BA / QA | Defining a requirement and proving it works are two different things; working code doesn't mean the whole journey works. |
| Jerome Altamia | UX | Turn learner research into clearer instructions and feedback, and treat errors, saved progress and returning users as part of UX. |
| MacKenzie Selleck | Developer | Don't trust what an AI model returns, keep decisions documented for a five-person team, and work around blockers to keep the project moving. |
| Sarah Salman | Developer | Building the BB84 simulator took a lot of quantum research; first full-stack project applying everything from assignments. |
