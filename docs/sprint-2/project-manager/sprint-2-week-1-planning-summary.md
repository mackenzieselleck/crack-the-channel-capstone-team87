# Sprint 2, Week 1: PM Planning Summary

**Team 87: Crack the Channel (IBM Cyber Security: Quantum Risks)**
**Author:** Thomas Clowes (Project Manager)
**Covers:** Sprint 2 planning and Planner restructure, team decisions, allocation, risks and open items

---

## 1. Purpose

This page records how Sprint 2 was planned: what the team decided, how work is split, and what is still open. It supports the Planner board and the Master Document. The meeting minutes it draws on are linked below.

- Minutes: General Group Meeting, 26 August 2026
- Minutes: General Team Meeting, 17 September 2026

## 2. Sprint 2 scope

Emily confirmed the Sprint 2 scope: authentication, the AI learning assistant, gamification and Daily Challenges. This is subject to quality delivery and Planner compliance. All AI, Daily Challenge and gamification stories are Should Haves, so they add depth on top of the core BB84 learning flow.

The core Sprint 2 flow is:

- accessing the platform and understanding the learning goal (US-01, US-02)
- running BB84 as Alice or Bob (US-06 to US-08)
- understanding the exchange outcome, Eve's impact, QBER and the security meaning (US-09 to US-13)
- contextual feedback, technical-term explanations and a final summary (US-14 to US-16)
- account creation and progress tracking (US-17 to US-19)

## 3. How the Planner is now organised

Following the 17 September meeting the board was restructured around user stories.

- **One parent card per user story** (`US-xx Title`). Its Notes hold the story, positive and negative acceptance criteria, and dependencies.
- **Sub-cards per story** (`— Circuit`, `— UI`, `— Build`, `— Content`, `— QA`), each with a "Done When" checklist. Sub-cards can be merged into the parent if one person will deliver the whole story.
- **Labels** show the discipline (DEV, UX, BA) and the sprint.
- **Status:** the story cards for US-06 to US-19 have their notes and checklists populated. The acceptance criteria are drafts to be reconciled with the Final Requirements (Srilekha). US-21 has been written up for Sprint 3.
- The previous task cards remain in the OLD buckets until every approved feature has a story card. AI assistant, Daily Challenge and XP/badges still need story cards.

## 4. Proposed Sprint 3 split

To keep Sprint 2 focused, seven Should Have stories are proposed for Sprint 3:

| Story | Title                             |
| ----- | --------------------------------- |
| US-21 | Receive Guidance (AI hints)       |
| US-22 | Receive Appropriate AI Support    |
| US-24 | Progress Through Challenge Levels |
| US-26 | Receive Hints                     |
| US-29 | See My Learning Level             |
| US-30 | Celebrate Milestones              |
| US-31 | Return to Continue Learning       |

US-20 (AI Bot), US-23 (Daily Challenge), US-25 (challenge feedback), US-27 (XP) and US-28 (achievements) stay in Sprint 2 as thin first versions. This split will be confirmed with Emily.

## 5. Ownership and decisions

| Area                                                       | Owner     | Notes                                                                                                                   |
| ---------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------- |
| All BB84 / Qiskit work                                     | Sarah     | She built the proof of concept and is the primary owner of all BB84 integration, post-processing and service hardening. |
| Learning modules, quizzes and progress tracking (backend)  | MacKenzie | JSON/DB-driven modules aligned with Jerome's wireframes. No learning content is being written yet, only the mechanism.  |
| Front end: login/sign-up, dashboard/profile, badge visuals | Jerome    | Reuses the Sprint 1 spike.                                                                                              |
| Requirements, acceptance criteria, test cases              | Srilekha  | Reconciles the acceptance criteria and drafts test cases.                                                               |
| Planner, coordination, minutes, supervisor contact         | Tom       |                                                                                                                         |

Decisions (from the 17 September meeting):

1. Dev work is the Sprint 2 priority, and specialist documentation takes a back seat.
2. Badges and XP wait until the learning module structure is settled.
3. The AI assistant uses an open-source model.
4. Supabase/Postgres remains the database.
5. Sarah leads all Qiskit work.

## 6. Dependencies and risks

| Item                                          | Effect                                              | Action                                                                               |
| --------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Hosting decision (ADR 001) not yet signed off | Blocks deployment of the web app and Qiskit service | Tom to obtain written sign-off from Alessio/Emily                                    |
| Docker and hosting ownership                  | Risk of duplicate or unowned work                   | Confirm the owner with MacKenzie and Sarah                                           |
| Learning-module structure                     | US-18, US-19, XP and badges depend on it            | MacKenzie to settle it first                                                         |
| AI agent failure handling                     | Needed before the assistant is relied on            | Raise with Emily; define timeouts and fallbacks                                      |
| API key incident (IBM sandbox)                | Serious marks penalty for exposed keys              | No keys in git, in LLM chats or in coding assistants. Use environment variables only |

## 7. Open items

- Written hosting sign-off from Alessio/Emily.
- Owner of the Docker and hosting work.
- Owner of logout and the profile page (US-17).
- Story cards for US-20, 23, 25, 27 and 28.
- Sprint 3 story cards for US-22, 24, 26, 29, 30 and 31.
- Confirming the Sprint 3 split with Emily.
