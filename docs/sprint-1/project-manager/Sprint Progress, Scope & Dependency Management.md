# Crack the Channel — Risk & Dependency Log

| | |
|---|---|
| **Team** | Team 87 — IBM Cyber Security: Quantum Risks |
| **Client** | IBM via RMIT Capstone Consultancy |
| **Project** | Crack the Channel — Interactive QKD (BB84) Learning Platform |
| **Prepared by** | Thomas Clowes — Project Manager |
| **Document Status** | Sprint 1 — Week 2 Update |
| **Purpose** | This log is reviewed weekly and updated as risks are mitigated, dependencies are resolved, and new items are identified. |

## 1. Purpose of This Document

This document is the Sprint 1 risk and dependency register for the Crack the Channel — Interactive QKD (BB84) Learning Platform. It records identified project risks and dependencies, their owners and current status, outstanding decisions required from the client and academic supervisor, and the review process for keeping this log current.

## 2. Risk Register

**RISK-01 — Engagement Feature Timeline**
Description: Limited time to implement long-term user engagement and retention features (e.g. streaks, progress tracking) within the Sprint 1 timeframe.
Owner: Dev
Status: Open
Notes: Raised by Dev during Sprint 1 planning. May require de-scoping to a later sprint or reducing to a minimum viable version if timeline pressure continues.

**RISK-02 — BA Task Timeline Shift**
Description: BA refinement work (learning observations, requirements refinement) extended into Week 2 due to a shift in the BA's external certification deadline.
Owner: BA
Status: **Closed** — completed Week 2 (06/09/2026). Refined Requirements & User Stories Baseline (v2.0) delivered, including updated scope covering authentication, AI learning bot, Daily Quantum Challenges and gamification.

**RISK-03 — Task Card Scope Mismatch (New)**
Description: MacKenzie's original Week 1–2 Dev card ("Frontend Framework Spike & Dev Environment Setup") scoped her to select a frontend framework, but the framework had already been locked in via ADR 001 before the card was actioned, making the original task obsolete as written.
Owner: PM
Status: **Closed** — original card closed with an explanatory comment; replaced with a new card ("Boilerplate & Initial Template Setup") scoped to the confirmed stack, with the Jerome-wireframe dependency logged directly on the card.

**RISK-04 — Board Understating Real Progress (New)**
Description: MacKenzie's and Jerome's Planner cards showed 0/7 checklist items complete ahead of the Week 2 deadline, despite both having substantial real progress (MacKenzie: working boilerplate with auth; Jerome: journey map and documentation complete). Risk that Planner exports and performance summaries would understate actual work if pulled before boards were corrected.
Owner: PM
Status: **Managed** — confirmed directly with both team members and corrected board/log entries accordingly. Recommend team members tick checklist items or comment on cards as work completes, rather than at the deadline.

## 3. Dependency Register

**DEP-01 — Hosting Environment Decision**
Description: The hosting environment for the platform (IBM lab server, IBM Cloud, or self-hosted) required confirmation before Sprint 1 infrastructure work could begin.
Owner: Alessio Bonti / Emily Chin
Status: **Partially resolved** — hosting proposed and documented as Render + Docker in ADR 001 (Qiskit microservice, dockerised, deployed to Render). Marked in the ADR as pending formal team/client approval. Formal client sign-off still outstanding — escalated to Emily/Alessio Week 2.

**DEP-02 — Architecture Stack Sign-Off**
Description: The full architecture stack (frontend, backend, database, authentication, Qiskit and AI-agent integration) requires review and agreement from the whole team, followed by sign-off from the client.
Owner: Team / Client
Status: Open
Notes: Architecture overview and ADRs (001–005) completed and shared internally. Client validation still required — bundled into the Week 2 scope-escalation message to Emily/Alessio.

**DEP-03 — Client Proposal A Sign-Off**
Description: Formal client sign-off on Proposal A.
Owner: Alessio Bonti / Emily Chin
Status: Deferred
Notes: Intentionally held pending scope finalisation.

**DEP-04 — MacKenzie's Boilerplate Work Depends on Jerome's Wireframes (New)**
Description: MacKenzie's boilerplate/frontend build work cannot meaningfully proceed into UI implementation until Jerome's UX/wireframes are finalised.
Owner: UX (Jerome) → Dev (MacKenzie)
Status: Open
Notes: Logged directly on MacKenzie's Planner card as a checklist item. Jerome's journey map and documentation are complete; wireframes still in progress as of Week 2.

**DEP-05 — Email/Domain Decision for User Onboarding (New)**
Description: Supabase's built-in email does not support confirmation emails the way Firebase does (2 emails/hour limit). A paid domain + service (e.g. Resend) would be needed to implement full onboarding email confirmations.
Owner: Emily Chin / Alessio Bonti
Status: Open
Notes: Raised in the Week 2 scope-escalation message — awaiting a decision on whether this is a priority given it is primarily an onboarding concern.

## 4. Outstanding Client Decisions

As of Sprint 1 Week 2, the following remain open with Emily Chin (Product Owner) and/or Alessio Bonti (Academic Supervisor):

- Confirm the Sprint 2 scope expansion (auth, AI bot, gamification, Daily Challenges) as committed work vs. stretch goals
- Formal sign-off on the hosting decision (Render/Docker, per ADR 001) — see DEP-01
- Sign off on the architecture stack — see DEP-02
- Sign off on Proposal A — see DEP-03
- Decide priority of email/domain setup for onboarding — see DEP-05
- Agree the cadence and channel for client updates during Sprint 1 and beyond

## 5. Review & Change Control

This log is reviewed weekly by the Project Manager and updated as risk/dependency status changes or new items are identified. Resolved items are retained with a status of Closed and a closure note, rather than removed, to preserve a record for the sprint retrospective and final project documentation.
