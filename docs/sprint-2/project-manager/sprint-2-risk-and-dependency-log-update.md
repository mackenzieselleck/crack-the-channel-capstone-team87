# Crack the Channel — Risk & Dependency Log: Sprint 2 Close Update

|                     |                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Team**            | Team 87 — IBM Cyber Security: Quantum Risks                                                                           |
| **Project**         | Crack the Channel — Interactive QKD (BB84) Learning Platform                                                          |
| **Prepared by**     | Thomas Clowes — Project Manager                                                                                       |
| **Date**            | 4 October 2026                                                                                                        |
| **Document Status** | Sprint 2 close update to the Sprint 1 log (`docs/sprint-1/project-manager/Risks-and-Dependencies.md`)                 |
| **Purpose**         | Records the status of every Sprint 1 item at Sprint 2 close and adds the risks and dependencies found during Sprint 2 |

## 1. Scope change recorded this sprint

The AI learning chatbot was swapped for AI-powered Daily Challenges. This change was signed off. The open-source LLM is still needed, but now for Daily Challenge text and feedback, so the LLM choice is tracked below as RISK-04.

## 2. Risk Register (Sprint 2 close)

| ID      | Risk                                                       | Owner         | Status                     | Notes                                                                                                                                              |
| ------- | ---------------------------------------------------------- | ------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| RISK-01 | Engagement feature timeline (XP, badges, streaks)          | Dev           | Open, moved to Sprint 3    | XP and badges migrations and UI delivered (PR #16). Award logic and streaks not done.                                                              |
| RISK-02 | BA task timeline shift                                     | BA            | Closed                     | Refined requirements (Rev 3.1) delivered.                                                                                                          |
| RISK-03 | Daily Challenge not yet run end to end (high)              | Dev 2         | Open                       | Backend merged in PR #20 (five challenge types, API routes, LLM prompts, tables). No screens yet. Needs the LLM chosen and module content loaded. |
| RISK-04 | Open-source LLM not chosen; weaker at maths               | Dev 2         | Open                       | Answers are checked by a SymPy-based checker rather than trusting the model. Timeout and failure handling still to be defined.                    |
| RISK-05 | Qiskit service may exceed Vercel's Python function size    | Dev 2         | Open                       | May need separate container hosting. Tested at the first Vercel deployment in Sprint 3.                                                           |
| RISK-06 | Limited testing                                            | BA / Dev      | Open                       | Backend unit tests merged (PR #19). Frontend, end-to-end and real-user usability testing planned for Sprint 3 (Weeks 8 and 9).                    |
| RISK-07 | Import defect in the Qiskit service after PR #20 | Dev 2 | Closed (4 Oct) | `app/challenges/__innit__.py` renamed to `__init__.py` and `api.py` import corrected to `.base` by MacKenzie. Service starts again once merged to `main`. |
| RISK-08 | 30 September task re-allocation compressed delivery time   | PM            | Managed                    | Reduced polish in Sprint 2; recovered by Sprint 3 planning.                                                                                        |

## 3. Dependency Register (Sprint 2 close)

| ID      | Dependency                                  | Owner                      | Status                          | Notes                                                                                                                                      |
| ------- | ------------------------------------------- | -------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| DEP-01  | Hosting decision                            | Team / Client              | Open, changed                   | Hosting moved to Vercel. Client confirmation pending. ADR 001 needs updating.                                                              |
| DEP-02  | Architecture stack sign-off                 | Team / Client              | Open                            | No client confirmation recorded as of 4 October.                                                                                           |
| DEP-03  | Client Proposal A sign-off                  | Alessio Bonti / Emily Chin | Open                            | No client confirmation recorded as of 4 October.                                                                                           |
| DEP-04  | Real learning module content (~5,400 words) | BA / UX                    | Open                            | Drafted; to be loaded in Sprint 3. Needed for the Daily Challenge multiple-choice category, which is skipped until content exists.        |
| DEP-05  | Daily Challenge screens                     | UX / Dev                   | Open                            | Needed before Daily Challenge frontend testing can begin.                                                                                  |

## 4. Outstanding client decisions

- Confirm that hosting on Vercel is acceptable (DEP-01).
- Confirm whether the MVP can be limited to one fully working learning module (DEP-04).
- Sign off the architecture stack (DEP-02) and Proposal A (DEP-03), or confirm they are no longer required.

## 5. Review

This log is reviewed weekly by the Project Manager. Resolved items stay in the log with a status of Closed and a closure note.
