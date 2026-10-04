# Sprint 2 Week 2 — PM Governance, Repo/PR Oversight & Planner Integrity

**Date:** 27/09/2026
**Prepared by:** Tom Clowes (PM)

## Summary

This covers PM governance and delivery-support work carried out across Sprint 1 close through Sprint 2 Week 1–2: the Sprint 1 Risk & Dependency Log, the Sprint 1 Client Review and Sprint 1 Close documentation, the Sprint 2 Week 1 planning summary and repo structure update, review and merge of team PRs into `main`, and a full audit of the Planner board this week to bring it in line with real GitHub evidence and direct teammate confirmations.

## PRs reviewed and merged into main

| PR  | Branch                              | Description                                                                       |
| --- | ----------------------------------- | --------------------------------------------------------------------------------- |
| #9  | `feature/BB84`                      | BB84 Qiskit service integration and post-processing                               |
| #10 | `jerome/auth-onboarding-frontend`   | US-01 landing page and auth/onboarding frontend                                   |
| #11 | `mackenzie/daily-challenge-feat`    | ADRs 006–014, revisions to ADRs 001/002/004/005, architecture overview change log |
| #12 | `refactor/BB84`                     | Qiskit service bugfix, NPC/user-role support, Dockerisation per ADR-004           |
| #13 | `sprint-2-learning-content`         | Sprint 2 learner-facing learning content                                          |
| #14 | `sprint-2-ba-review-week2-progress` | Sprint 2 Week 2 BA implementation review                                          |

## Planner board audit (this week)

Verified and corrected against GitHub evidence and direct teammate statements rather than assumptions:

- Set a 21/09 start date on this week's active cards.
- Populated Srilekha's Sprint 2 BA Implementation Review card with her authoritative task description, acceptance criteria and 13-item checklist (relayed directly by Srilekha), and marked it Completed based on her checklist and the newer completion comment confirming Week 3 grooming was reviewed with no changes required.
- Identified and resolved a duplicate card: MacKenzie's standalone "Build XP/badges backend" card overlapped with her broader AI/Daily Challenge microservice card, with no code yet existing for either. Added an explicit XP/badges checklist item to the surviving card, documented the merge rationale on both cards, and flagged the duplicate `[MERGED - PLEASE DELETE]` for MacKenzie to remove (not deleted directly, per PM practice of not performing irreversible deletions on a teammate's card without their own confirmation).
- Reverted a card title that had been mis-edited back to its correct original name ("Final QA validation against acceptance criteria and complete Sprint 2 review documentation").

## Outstanding

- MacKenzie to confirm and delete the flagged duplicate XP/badges card once reviewed.

## Related

- Master Document — Sprint 1, 2 and 3 (PM governance entry, Sprint 2 Week 2)
- docs/sprint-2/ba-review-week2-progress/Sprint-2-Week-2-BA-Review-Against-Week2-Progress.md
- docs/sprint-2/learning/Crack_the_Channel_Learning_Content.md
