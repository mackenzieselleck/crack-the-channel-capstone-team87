# Crack the Channel — Risk & Dependency Log

|                     |                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Team**            | Team 87 — IBM Cyber Security: Quantum Risks                                                                                                             |
| **Client**          | IBM via RMIT Capstone Consultancy                                                                                                                       |
| **Project**         | Crack the Channel — Interactive QKD (BB84) Learning Platform                                                                                            |
| **Prepared by**     | Thomas Clowes — Project Manager                                                                                                                         |
| **Document Status** | Sprint 1 — Initial Risk & Dependency Log                                                                                                                |
| **Purpose**         | This is an initial Sprint 1 log and will be reviewed weekly and updated as risks are mitigated, dependencies are resolved, and new items are identified |

## 1. Purpose of This Document

This document establishes the Sprint 1 risk and dependency register for the Crack the Channel — Interactive QKD (BB84) Learning Platform.

It records:

- Identified project risks, their owners and current status
- Identified dependencies blocking or affecting project work, their owners and current status
- Outstanding decisions required from the client and academic supervisor
- Review and change-control process for keeping this log current

## 2. Risk Register

### RISK-01 — Engagement Feature Timeline

**Description:** Limited time to implement long-term user engagement and retention features (e.g. streaks, progress tracking) within the Sprint 1 timeframe.

**Owner:** Dev

**Status:** Open

**Notes:** Raised by Dev during Sprint 1 planning. May require de-scoping to a later sprint or reducing to a minimum viable version if timeline pressure continues.

### RISK-02 — BA Task Timeline Shift

**Description:** BA refinement work (learning observations, requirements refinement) extends into Week 2–3 due to a shift in the BA's external certification deadline.

**Owner:** BA

**Status:** Managed

**Notes:** A separate Week 2–3 task card has been created to track this work, in line with the assignment's requirement that a completed task card cannot be reassigned.

## 3. Dependency Register

### DEP-01 — Hosting Environment Decision

**Description:** The hosting environment for the platform (IBM lab server, IBM Cloud, or self-hosted) has not yet been confirmed. This is required before Sprint 1 infrastructure work can begin.

**Owner:** Alessio Bonti / Emily Chin

**Status:** Open

**Notes:** Flagged as an outstanding client decision; to be raised at the Week 2 scope-alignment meeting.

### DEP-02 — Architecture Stack Sign-Off

**Description:** The full architecture stack (frontend, backend, database, authentication, Qiskit and AI-agent integration), documented as a set of Architecture Decision Records, requires review and agreement from the whole team, followed by sign-off from the client, before Dev proceeds with confidence.

**Owner:** Team / Client

**Status:** Open

**Notes:** Architecture overview and ADRs completed and shared internally in Sprint 1 Week 1; client validation still required.

### DEP-03 — Client Proposal A Sign-Off

**Description:** Formal client sign-off on Proposal A has not yet been obtained.

**Owner:** Alessio Bonti / Emily Chin

**Status:** Deferred

**Notes:** Sign-off is being intentionally held until scope is finalised at the Week 2 team meeting, to avoid signing a proposal that is about to change. Emily has been informed of this decision.

## 4. Outstanding Client Decisions

The following decisions are required from Emily Chin (Product Owner) and/or Alessio Bonti (Academic Supervisor) and remain open as of Sprint 1 Week 1:

- Confirm whether the Sprint 1 mock-up/infrastructure bar is a formal client requirement
- Decide the hosting environment (see DEP-01)
- Agree the cadence and channel for client updates during Sprint 1 and beyond
- Confirm who should be looped in on decisions versus informed after the fact
- Sign off on Proposal A (see DEP-03)
- Sign off on the architecture stack (see DEP-02)

## 5. Review & Change Control

This log is reviewed weekly by the Project Manager and updated as risk/dependency status changes or new items are identified. Resolved items are retained with a status of _Closed_ and a closure note, rather than removed, to preserve a record for the sprint retrospective and final project documentation.
