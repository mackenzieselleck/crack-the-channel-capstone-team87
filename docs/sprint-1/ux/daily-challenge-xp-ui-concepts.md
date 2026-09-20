# Crack the Channel - Daily Challenge and XP UI Concepts

## Purpose

This document defines the proposed UX direction for Daily Challenges, XP, badges and learning progression for Sprint 2.

The aim is to keep progression easy to understand, reward meaningful learning activity, and support learners returning to the platform over multiple sessions.

The proposed learning structure is:

- Learning content is organised into major modules.
- Each module is broken into smaller learning segments.
- Learner progress should be saved as they progress through module segments.
- Saved progress should persist across sessions so learners can continue where they left off.
- Each major module should end with a multiple-choice test.
- A learner should achieve at least **70% correct** to pass the module test.
- Learners should be able to retry module tests without an attempt limit.
- Module-completion XP and the associated badge should be awarded after the learner passes the module test.
- Unpublished or incomplete modules should remain hidden from normal learner navigation.
- Answer keys should not be exposed in learner-facing interfaces.

These concepts are intended to guide the frontend and backend implementation while keeping exact reward values and content configurable.

---

# 1. Core Progression Model

The learner progression model should remain simple and understandable:

```text
Learning Module
      |
      v
Module Segments
      |
      v
End-of-Module Test
      |
      +--> Below 70% --> Retry available
      |
      +--> 70% or higher
                |
                v
         Module Completed
                |
                v
          XP + Badge Awarded
```

The key UX principle is that **content progress and module completion are separate states**.

A learner may finish all module segments, but the module is only treated as fully completed for reward purposes after the learner passes the module test.

---

# 2. Learning Progress UI

## 2.1 Module Card

Each available learning module should be represented by a clear module card.

### Recommended information

- Module title
- Short description
- Module progress
- Number of completed segments
- Module status
- Primary action

### Example states

**Not Started**

```text
INTRODUCTION TO QUBITS

Learn the fundamentals of qubits and quantum states.

Progress: 0 / 5 segments

[ START MODULE ]
```

**In Progress**

```text
INTRODUCTION TO QUBITS

Progress: 3 / 5 segments
████████████░░░░░░ 60%

[ CONTINUE ]
```

**Ready for Test**

```text
INTRODUCTION TO QUBITS

Learning content complete
End-of-module test available

[ TAKE TEST ]
```

**Completed**

```text
INTRODUCTION TO QUBITS

Completed ✓
Test score: 80%

XP earned
Badge earned

[ REVIEW MODULE ]
```

---

## 2.2 Segment Progress

Inside a module, the learner should always be able to identify:

- which segment they are currently on;
- which segments are complete;
- how many remain;
- what happens when they select Next.

Example:

```text
MODULE 2 - BB84 FUNDAMENTALS

1  Introduction          ✓
2  Alice prepares bits   ✓
3  Bob measures          CURRENT
4  Compare bases
5  QBER

[ PREVIOUS ]                         [ NEXT ]
```

When the learner progresses successfully, the interface should make it clear that progress has been saved.

Example:

```text
Progress saved ✓
```

This helps reassure the learner that they can leave the platform and return later without restarting the module.

---

# 3. End-of-Module Test UX

## 3.1 Test Entry State

Once all learning segments in a module have been completed, the module test should become the clear next step.

Example:

```text
MODULE CONTENT COMPLETE

You have completed all learning segments.

Complete the module test to earn:
XP
Module Badge

Pass mark: 70%

[ START TEST ]
```

The learner should know the pass requirement before starting the test.

---

## 3.2 Test Question UI

Tests should use a simple multiple-choice format.

Recommended layout:

```text
MODULE TEST

Question 3 of 10

Why are mismatched bases discarded in BB84?

○ Option A
○ Option B
○ Option C
○ Option D

[ NEXT QUESTION ]
```

The interface should show:

- question number;
- total number of questions;
- selected answer;
- current test progression;
- a clear submission action.

Answer keys and hidden correctness data should not be exposed through the learner-facing interface.

---

## 3.3 Test Result States

### Pass

A learner passes at **70% or higher**.

Example:

```text
MODULE PASSED ✓

Score: 8 / 10
80%

You completed Introduction to BB84.

+150 XP
Badge earned: BB84 Beginner

[ CONTINUE LEARNING ]
```

The reward should be clearly linked to successful module completion.

### Below Pass Mark

If the learner scores below 70%:

```text
KEEP LEARNING

Score: 6 / 10
60%

You need 70% to complete this module.

Review the module or try the test again when ready.

[ REVIEW MODULE ]    [ RETRY TEST ]
```

Recommended behaviour:

- Previous module progress remains saved.
- The learner is not penalised for retrying.
- The module-completion badge and XP are not awarded yet.
- The learner can retry the test as many times as needed.

---

# 4. XP Concept

## 4.1 Purpose

XP should represent meaningful learning progress rather than arbitrary interaction.

The main XP reward should be connected to successful learning outcomes.

Example:

```text
Pass end-of-module test
        |
        v
Award module XP
```

Additional XP sources may be used for activities such as Daily Challenges, provided they also represent meaningful learning activity.

---

## 4.2 XP Display

XP should be visible without dominating the learning experience.

Recommended locations:

- learner dashboard;
- progress/profile screen;
- module completion feedback;
- Daily Challenge completion feedback.

Example:

```text
LEVEL 3
620 XP

██████████████░░░░░░
180 XP to next level
```

Where levels are used, the learner should be able to understand:

- their current XP;
- their current level;
- how much progress remains before the next level.

---

## 4.3 XP Award Feedback

When XP is awarded, provide short confirmation.

Example:

```text
+150 XP

Module completed
```

Routine XP feedback should remain lightweight.

More noticeable celebratory feedback can be reserved for meaningful milestones such as:

- first module completed;
- pathway completion;
- significant level milestone;
- special badge achievement.

---

# 5. Badge Concept

## 5.1 Module Completion Badges

Badges should represent clear learning achievements.

Recommended module badge logic:

```text
Complete module learning content
        +
Pass module test with 70%+
        =
Earn module badge
```

Example:

```text
BADGE EARNED

BB84 BEGINNER

Passed the BB84 Fundamentals module test.
```

The learner should be able to understand why each badge was earned.

---

## 5.2 Locked Badge State

Badges that have not yet been earned can appear on the progress screen with clear requirements.

Example:

```text
BB84 BEGINNER
Locked

Complete the BB84 Fundamentals module
and pass the test with 70% or higher.
```

This keeps achievement criteria transparent.

---

# 6. Daily Challenge Concept

Daily Challenges should complement the structured learning modules rather than replace them.

The module system remains the primary learning pathway.

Daily Challenges provide short repeat-practice opportunities based on concepts the learner has already encountered.

---

## 6.1 Daily Challenge Card

Recommended dashboard card:

```text
DAILY QUANTUM CHALLENGE

Today's topic: BB84 Bases

Which basis would Bob use to perform
a diagonal-basis measurement?

Estimated time: 2 min

[ START CHALLENGE ]
```

The challenge should feel lightweight and easy to begin.

---

## 6.2 Daily Challenge Eligibility

Daily Challenge content should be appropriate to the learner's current progression.

Recommended rule:

- Challenge learners on concepts from modules or segments already available to them.
- Avoid asking about advanced topics before they have been introduced in the learning pathway.

This keeps Daily Challenges connected to the learner's structured progress.

---

## 6.3 Daily Challenge Interaction

A simple multiple-choice or short scenario format is recommended.

Example:

```text
DAILY CHALLENGE

Alice sends a photon using the + basis.
Bob chooses the × basis.

What should happen to this position
during basis reconciliation?

○ Keep it
○ Discard it
○ Reveal the secret key
○ Repeat the transmission

[ SUBMIT ]
```

---

## 6.4 Daily Challenge Feedback

After submission, the learner should receive:

- a correct or incorrect state;
- a short explanation;
- another attempt where appropriate;
- completion feedback after successfully finishing the challenge.

Correct example:

```text
CORRECT ✓

Because Alice and Bob used different bases,
this position is discarded during reconciliation.

[ COMPLETE CHALLENGE ]
```

Incorrect example:

```text
NOT QUITE

Think about what happens when Alice and Bob
use different measurement bases.

[ TRY AGAIN ]
```

Hints can also be provided where implemented.

---

# 7. Daily Challenge Reward Concept

Daily Challenges may award XP, but the reward should remain smaller than a major module-completion reward.

Recommended reward hierarchy:

```text
Daily Challenge
Small XP reward

End-of-Module Test Pass
Larger XP reward + badge

Major Learning Milestone
Larger achievement feedback
```

Exact XP values should remain configurable rather than being fixed by the UX documentation.

Example:

```text
DAILY CHALLENGE COMPLETE ✓

+20 XP

Come back tomorrow for another challenge.
```

If streaks are introduced later, they should support motivation without becoming a requirement for progression.

---

# 8. Dashboard Concept

The learner dashboard should bring together learning progress, Daily Challenges and achievements without becoming overloaded.

Recommended sections:

## Continue Learning

```text
BB84 FUNDAMENTALS
3 / 5 segments complete

[ CONTINUE ]
```

## Daily Challenge

```text
Today's Challenge
BB84 Basis Matching

[ START ]
```

## Progress

```text
Level 3
620 XP

4 modules completed
```

## Recent Badge

```text
BB84 BEGINNER
Earned after passing the BB84 module test
```

The dashboard should make the learner's next meaningful action easy to identify.

---

# 9. Progress Persistence UX

Learner progress should persist between sessions.

When a learner returns, the interface should reflect their most recent valid progress.

Example:

```text
WELCOME BACK

Continue where you left off?

BB84 Fundamentals
Segment 3 of 5

[ CONTINUE MODULE ]
```

Learners should not have to restart module segments they have already completed.

---

# 10. Published and Unpublished Modules

The learning system should support modules that are ready for learners as well as modules still being prepared.

### Published module

- Visible to learners.
- Available according to the learning progression rules.

### Unpublished module

- Hidden from normal learner navigation.
- Not directly presented as usable learning content.
- Should not appear as a broken or empty module.

This allows new learning content to be prepared without exposing unfinished material to users.

---

# 11. Recommended Learner States

| State | Meaning | Primary action |
| --- | --- | --- |
| Not Started | Learner has not begun | Start Module |
| In Progress | Some segments completed | Continue |
| Ready for Test | All segments completed | Take Test |
| Test Not Passed | Test attempted below 70% | Retry Test / Review |
| Completed | Test passed with 70%+ | Review Module |

These states provide a clear shared model for UX, frontend and backend implementation.

---

# 12. UX Rules

### Learning comes first

XP and badges should support the learning experience rather than become the main purpose of the platform.

### Rewards require meaningful actions

Module-completion rewards should only be awarded after the learner meets the required completion condition.

### Retry without punishment

A failed module test should clearly provide another path forward without removing previous progress.

### Progress should always be understandable

The learner should know:

- what they have completed;
- what they are currently doing;
- what remains;
- what action comes next.

### Persistent progress should be visible

Returning learners should see progress that accurately reflects their previous session.

### Hidden content stays hidden

Unpublished modules and answer keys should not be exposed through learner-facing UI.

---

# 13. Proposed User Flow

```text
Dashboard
   |
   +-------------------------+
   |                         |
   v                         v
Continue Module         Daily Challenge
   |                         |
   v                         v
Module Segment          Challenge Question
   |                         |
   v                         v
Next Segment            Submit Answer
   |                         |
   v                         v
Progress Saved          Feedback
   |                         |
   v                         v
Final Segment           Challenge Complete
   |                         |
   v                         v
Module Test             Small XP Reward
   |
   v
Score >= 70%?
   |
   +---- No ----> Review / Retry
   |
  Yes
   |
   v
Module Complete
   |
   +--> XP Awarded
   |
   +--> Badge Awarded
   |
   v
Next Learning Activity
```

---

# 14. Open Decisions

The following details can remain configurable until the team confirms them:

- Exact XP amount for module completion.
- Exact XP amount for Daily Challenges.
- Level thresholds and how many levels are used.
- Whether Daily Challenge streaks are included.
- How Daily Challenges are selected or scheduled.
- Whether failed module-test questions receive immediate feedback or only end-of-test feedback.
- Whether the learner sees their highest test score, latest score, or both.
- Whether badges are only tied to modules or can also be tied to broader milestones.
- Exact visual treatment for XP gain, badges and celebration states.

---

# 15. Sprint 2 UX Deliverable Definition of Done

The Daily Challenge / XP UI concept is ready when:

- module progress states are documented;
- the 70% module-test pass requirement is represented;
- unlimited retries are supported without learner penalties;
- badge and XP rewards are linked to successful module completion;
- Daily Challenge entry, question, feedback and completion states are documented;
- learner XP/progress visibility is defined;
- persisted progress and resume behaviour are represented;
- unpublished modules remain hidden from learners;
- exact reward values remain configurable rather than hard-coded.
