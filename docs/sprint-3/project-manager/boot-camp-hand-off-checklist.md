# January Boot Camp Hand-off Checklist

| | |
|---|---|
| **Project** | Crack the Channel: interactive BB84 learning platform for IBM's Quantum Boot Camp (January 2027) |
| **Team** | Team 87 |
| **Prepared** | 27 October 2026, Thomas Clowes (PM); updated 28 October 2026 |
| **Full detail** | Handover Document, Section 9 (`87 - Crack the Channel - handover.docx`) |

Tick each item when it is done. Status at preparation is either **Done**, **Open** or **Check** (likely done, needs confirming). Owners are the team members who hold the item now.

## 1. Accounts and access (before the semester ends)

Student accounts can close after the semester, which would take the site down. Never paste keys into documents; transfer them through each provider's settings.

| # | Item | Owner | Status |
|---|---|---|---|
| 1.1 | GitHub repository `mackenzieselleck/crack-the-channel-capstone-team87`: transfer to the client's organisation, or add a client admin | MacKenzie | Open |
| 1.2 | Vercel project (web app): transfer to the client's team; re-enter environment variables | MacKenzie | Open |
| 1.3 | Render service (Qiskit service): transfer, or recreate from `qiskit-service/Dockerfile` and update `QISKIT_SERVICE_URL` | Sarah | Open |
| 1.4 | Supabase project (database and auth): transfer to the client's organisation; rotate the service-role key | MacKenzie | Open |
| 1.5 | Domain: transfer to the client's registrar, or agree it will lapse and point the client's domain at Vercel | MacKenzie | Open |
| 1.6 | Groq API key: client creates its own key and sets `LLM_API_KEY`; revoke the student key | MacKenzie | Open |
| 1.7 | Resend (auth email): client verifies its sending domain and updates Supabase SMTP settings | MacKenzie | Open |
| 1.8 | Cloudflare Turnstile: client creates a widget for its domain and updates the site key and captcha secret | MacKenzie | Open |
| 1.10 | GitHub Actions secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`): replace with the client's values after the Vercel transfer | MacKenzie | Open |
| 1.11 | Rive project (badge artwork): invite a client designer or hand over the exported files | Srilekha | Open |
| 1.9 | `INTERNAL_API_KEY`: generate a new value and set it in Vercel and Render | MacKenzie / Sarah | Open |
| 1.12 | Planner board exported to Excel and shared with the next team | Tom | Open |

## 2. Code and data

| # | Item | Owner | Status |
|---|---|---|---|
| 2.1 | All Sprint 3 work merged to `main` (last merge PR #56, 28 Oct) | Team | Done |
| 2.2 | Learning content in the repository as a migration, so a rebuild includes it (`20261025070916_add_module_content.sql`) | MacKenzie | Done |
| 2.3 | 8 badges and award rules in migrations (PR #45) | MacKenzie | Done |
| 2.4 | Add `my-app/.env.example` listing every variable (names only, no values) | Dev team | Open |
| 2.5 | Replace the default Next.js text in `my-app/README.md` with setup steps from Handover Section 9.1 | Dev team | Open |
| 2.6 | Someone outside the team follows Handover Section 9.1 on a clean machine; fix any step that breaks | Sarah / MacKenzie | Open |
| 2.7 | Stale branches (46 remain on GitHub) closed or deleted | MacKenzie | Open |

## 3. Quality and known issues (before the Boot Camp)

| # | Item | Owner | Status |
|---|---|---|---|
| 3.1 | LLM answer-leak and request-configuration gaps from `LLM-Prompting-QA.md` fixed (PR #50); paraphrased answers can still pass the string check | Jerome | Done |
| 3.2 | Badge pop-up defects from `Badge-Logic-QA.md` fixed and re-tested (PRs #46, #49) | Jerome | Done |
| 3.3 | Simulator input validation (SIM-DEF-01, fixed in PR #52) and service-down handling (SIM-20, still untested) | Next team | Open (SIM-20 only) |
| 3.4 | `submit_quiz()` double-XP race (found by the PR #34 tests; no row lock in the current function) | Next team | Open |
| 3.5 | CI workflow merged to `main` (PR #48): lint, types, unit, database (pgTAP), build and end-to-end tests, then Vercel deploy. Qiskit pytest not yet included | MacKenzie | Done |
| 3.6 | Usability pilot with first-year students; top findings fixed | Jerome / next team | Open |
| 3.7 | Accessibility (WCAG 2.1 AA) and mobile check | Next team | Open |

## 4. Running it for a Boot Camp cohort

| # | Item | Owner | Status |
|---|---|---|---|
| 4.1 | Render instance always on, or a keep-warm ping, so the first simulator run isn't slow | Client | Open |
| 4.2 | Groq rate limits and the app's LLM budgets (`LLM_*_PER_*`) sized for the cohort | Client | Open |
| 4.3 | Supabase plan and auth email limits checked for a cohort's sign-ups on one day | Client | Open |
| 4.4 | Dry run with facilitators: sign-up, one module, simulator with Eve, one Daily Challenge | Client | Open |

## 5. Documents handed over

| # | Item | Location | Status |
|---|---|---|---|
| 5.1 | Handover Document | Submitted with the Week 9 files | Done |
| 5.2 | Architecture overview and ADR-001 to ADR-014 | `docs/sprint-1/architecture/` | Done |
| 5.3 | Daily Challenge technical guide | `docs/sprint-3/daily-challenge-documentation.md` | Done |
| 5.4 | QA and test reports (11) | `docs/sprint-3/qa-test-cases/`, `docs/sprint-3/testing/`, `docs/sprint-3/LLM-Prompting-QA.md` | Done |
| 5.5 | Risk register (final state) | Handover Document, Section 8; working log in `docs/sprint-3/project-manager/` | Done |
| 5.6 | Sprint 3 retrospective | `docs/sprint-3/project-manager/sprint-3-retrospective.md` | Done |
| 5.7 | Final presentation and video | Canvas submission | Open |

## 6. Contacts

| Name | Role | Contact | Available until |
|---|---|---|---|
| Thomas Clowes | Project Manager (first point of contact) | s4089595@student.rmit.edu.au | End of Semester 2, December 2026 |
| MacKenzie Selleck | Developer (architecture, Daily Challenges, hosting, CI/CD) | s4087110@student.rmit.edu.au | End of Semester 2, December 2026 |
| Sarah Salman | Developer (Qiskit service, simulator) | Through Thomas Clowes | End of Semester 2, December 2026 |
| Jerome Altamia | UX/UI and QA | Through Thomas Clowes | End of Semester 2, December 2026 |
| Srilekha Byreddy | Business Analyst / QA | Through Thomas Clowes | End of Semester 2, December 2026 |
| Alessio Bonti | Academic Supervisor, RMIT | via RMIT | — |
| Emily Chin | Product Owner | via RMIT | — |
