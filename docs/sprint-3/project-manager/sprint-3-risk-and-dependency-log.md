# Crack the Channel — Risk & Dependency Log: Sprint 3 Update

|                     |                                                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Team**            | Team 87 — IBM Cyber Security: Quantum Risks                                                                                      |
| **Project**         | Crack the Channel — Interactive QKD (BB84) Learning Platform                                                                     |
| **Prepared by**     | Thomas Clowes — Project Manager                                                                                                  |
| **Date**            | 18 October 2026 — statuses are accurate at time of writing (7:30pm)                                                              |
| **Document Status** | Sprint 3 update to the Sprint 2 close log (`docs/sprint-2/project-manager/sprint-2-risk-and-dependency-log-update.md`)           |
| **Purpose**         | Records the status of every Sprint 2 item as of 18 October and adds the risks and dependencies found so far in Sprint 3          |

## 1. Sprint 3 progress since the last log (4 October)

Merged to `main` between 4 and 18 October:

- **Deployment:** web app deployed (PR #24), with follow-up deployment fixes (PR #32, PR #33). Qiskit service import fixed for the Render deployment (14 October).
- **Authentication:** password reset, confirmation email resend, Turnstile on auth forms and stronger auth guards (PR #30). Sign-up redirect fix and regression tests (PR #23, PR #25).
- **Simulator:** BB84 simulator frontend updates and QBER feedback (PR #28). Eve / no-Eve QBER refactor with unit tests (PR #22).
- **Profile and engagement:** profile frontend showing XP, challenge streak and badges (PR #27). Badge designs and animations (PR #29). 55 database tests for XP, badge and streak rules (PR #34).
- **Clean-up:** old spike pages, components and mascot removed (PR #35).

## 2. Risk Register (Sprint 3, 18 October)

| ID      | Risk                                                          | Owner     | Status                        | Notes                                                                                                                                                                                                                                                         |
| ------- | ------------------------------------------------------------- | --------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RISK-01 | Engagement feature timeline (XP, badges, streaks)             | Dev       | Mostly mitigated              | XP and badge award logic (`submit_quiz()`) and streak logic (`record_daily_solve()`) are in the database and covered by 55 passing tests. Profile shows XP, streak and badges. Streaks can only grow once learners can solve Daily Challenges (see RISK-03). |
| RISK-02 | BA task timeline shift                                        | BA        | Closed (Sprint 2)             | No change.                                                                                                                                                                                                                                                    |
| RISK-03 | Daily Challenge not yet run end to end (high)                 | Dev 2     | Open — **top risk**           | Backend and API routes (`/api/challenge/today`, `/api/challenge/submit`) exist, but there is still no Daily Challenge screen. With limited sprint time left this is the largest gap against the MVP. Depends on DEP-05 and DEP-06.                            |
| RISK-04 | Open-source LLM not chosen; weaker at maths                   | Dev 2     | Partly mitigated              | Timeout and failure handling now defined in `lib/daily_challenges/llm.ts` (30 s per attempt, 2 retries, Zod validation, answer-leak check). Answers are still graded by the SymPy checker. The model itself is set by `LLM_MODEL` and is not yet recorded.   |
| RISK-05 | Qiskit service may exceed Vercel's Python function size       | Dev 2     | Closed (14 Oct)               | Qiskit service hosted separately on Render as a container instead of as a Vercel function. See RISK-10 for the new hosting risk this introduces.                                                                                                             |
| RISK-06 | Limited testing                                               | BA / Dev  | Open, improving               | Added since Sprint 2: sign-up and `/learn/[slug]` regression tests, QBER unit tests and profile gamification database tests. Still missing: end-to-end tests, Daily Challenge frontend tests and real-user usability testing.                                |
| RISK-07 | Import defect in the Qiskit service after PR #20              | Dev 2     | Closed (Sprint 2)             | No change. A similar relative-import fix was needed for the Render deployment on 14 October (see RISK-09).                                                                                                                                                  |
| RISK-08 | 30 September task re-allocation compressed delivery time      | PM        | Closed                        | Recovered during Sprint 3 Week 1; most of the team's PRs merged on 11 October.                                                                                                                                                                                |
| RISK-09 | Build and deployment errors only found after merging (new)    | Dev       | Open                          | Four fixes were needed after code reached `main`: PR #32, PR #33, a TypeScript build error (11 Oct) and the Render import error (14 Oct). Mitigation: run `npm run build`, lint and the test suites before merging, ideally as a GitHub Actions check on PRs. |
| RISK-10 | Qiskit service availability on Render (new)                   | Dev 2     | Open — to confirm             | The simulator depends on a second hosted service. If the Render plan spins the service down when idle, the first simulator run may be slow or time out (the app returns a `503` when the service is unreachable). Confirm the plan and test a cold start.     |
| RISK-11 | Module navigation after spike clean-up (new)                  | Dev       | Open — to verify              | PR #35 deleted `app/(protected)/learn/page.tsx` as well as the spike pages. Only `/learn/[slug]` remains. Check that learners can still reach the learning module from the dashboard and that no links point to the removed page.                          |
| RISK-12 | Final-sprint scope pressure (new)                             | PM / Team | Open                          | Daily Challenge screens, real module content, end-to-end testing and usability testing all remain for the final sprint. If time runs short, agree with the client which items are cut rather than delivering all of them partly done.                      |

## 3. Dependency Register (Sprint 3, 18 October)

| ID     | Dependency                                    | Owner                      | Status                 | Notes                                                                                                                                                                          |
| ------ | --------------------------------------------- | -------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DEP-01 | Hosting decision                              | Team / Client              | Open, changed          | Now in use: Vercel (web app), Render (Qiskit service) and Supabase (database and auth). Client confirmation still to be recorded. ADR-001 still needs updating to match.       |
| DEP-02 | Architecture stack sign-off                   | Team / Client              | Open                   | No client confirmation recorded as of 18 October. Should be signed off against the updated ADR-001.                                                                            |
| DEP-03 | Client Proposal A sign-off                    | Alessio Bonti / Emily Chin | Open                   | No client confirmation recorded as of 18 October.                                                                                                                              |
| DEP-04 | Real learning module content (~5,400 words)   | BA / UX                    | Open — overdue         | Planned for Sprint 3 but the database still holds only the placeholder module. Blocks the Daily Challenge multiple-choice category and meaningful usability testing.            |
| DEP-05 | Daily Challenge screens                       | UX / Dev                   | Open — blocking        | Blocks RISK-03, streak growth (RISK-01) and Daily Challenge frontend testing.                                                                                                   |
| DEP-06 | Hosted LLM endpoint for production (new)      | Dev 2                      | Open                   | The deployed app needs `LLM_BASE_URL`, `LLM_MODEL` and, if required, `LLM_API_KEY`. Without an endpoint, Daily Challenge generation and feedback cannot run in production.     |
| DEP-07 | Resend and Cloudflare Turnstile (new)         | Dev                        | In place — monitor     | Added for auth emails and bot protection (PR #30). Keys must be set in every environment, and Resend free-tier sending limits may affect sign-up during usability testing.     |
| DEP-08 | Usability test participants (new)             | BA / UX                    | Open                   | Real-user testing needs participants booked and a stable deployed build. Depends on DEP-04 and DEP-05 being done first.                                                        |

## 4. Outstanding client decisions

- Confirm that the Vercel + Render + Supabase hosting setup is acceptable (DEP-01).
- Confirm whether the MVP can be limited to one fully working learning module (DEP-04).
- Agree which items are cut first if final-sprint time runs out (RISK-12).
- Sign off the architecture stack (DEP-02) and Proposal A (DEP-03), or confirm they are no longer required.

## 5. Review

This log is reviewed weekly by the Project Manager. Resolved items stay in the log with a status of Closed and a closure note.
