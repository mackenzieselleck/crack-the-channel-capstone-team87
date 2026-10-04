# Crack the Channel - Daily Challenges and XP UX Concepts

## Purpose

These UX concepts define how Daily Quantum Challenges, XP, badges, and learner progression can be presented within Crack the Channel while keeping structured BB84 learning as the primary experience.

The concepts are designed to support:
- beginner-friendly learning;
- clear progression and next steps;
- meaningful feedback;
- continued engagement;
- gamification that supports learning rather than replacing it.

---

## 1. Daily Challenge UX Concept

### 1.1 Dashboard Entry Card

The Daily Quantum Challenge should appear as a clear, optional activity on the learner dashboard.

```text
DAILY QUANTUM CHALLENGE

Test what you've learned today.

Today's Challenge
BB84 Basis Matching

Difficulty: Beginner
Reward: +20 XP

[ Start Challenge ]

Available today
```

The card should immediately communicate:
- what the activity is;
- the challenge topic;
- the difficulty;
- the XP reward;
- how to begin.

The Daily Challenge should complement the structured learning pathway rather than interrupting it.

---

### 1.2 Challenge Screen

The challenge screen should focus on one task at a time to reduce cognitive load.

```text
DAILY CHALLENGE                         Beginner

BB84 Basis Matching

Alice prepared a qubit using the X basis.
Bob measured using the Z basis.

What should Bob expect?

○ The original bit with certainty
○ An unpredictable measurement result
○ The qubit cannot be measured
○ Alice's basis automatically changes

[ Need a hint? ]

----------------------------------------

Progress: 1 challenge today
Reward: +20 XP

                         [ Submit Answer ]
```

### UX Principles

- Keep each challenge focused on one clear concept.
- Use beginner-friendly wording.
- Keep the challenge visually separate from the main learning module.
- Show the difficulty and reward without making them more prominent than the learning task.
- Provide an optional hint before submission.
- Avoid revealing the complete answer through the hint.

---

### 1.3 Correct Answer Feedback

After a correct submission:

```text
✓ Correct

Bob used a different basis from Alice, so the
measurement result is not guaranteed to match
the bit Alice encoded.

+20 XP

Challenge completed

[ Continue Learning ]
```

Feedback should explain why the answer is correct rather than only confirming success.

---

### 1.4 Incorrect Answer Feedback

After an incorrect submission:

```text
Not quite

Alice and Bob used different bases. When the
bases do not match, Bob cannot reliably recover
Alice's original bit.

[ Try Again ]
```

The learner should receive an explanation that helps them understand the mistake and continue learning.

---

### 1.5 Difficulty Progression

Three simple learner-facing difficulty tiers can be used:

```text
BEGINNER
Core concepts and recognition

INTERMEDIATE
Apply concepts to BB84 exchanges

ADVANCED
Analyse security, QBER and more complex scenarios
```

The platform should surface difficulty levels appropriate to the learner's progress.

Difficulty should increase as learners gain experience without requiring them to understand the underlying technical challenge categories.

---

## 2. XP UX Concept

XP should act as secondary feedback for meaningful learning progress.

It should not become the main purpose of the platform.

### 2.1 Persistent XP Display

A compact progress display can appear on the dashboard or profile page.

```text
LEVEL 3

420 / 600 XP

██████████████░░░░░░

180 XP until Level 4
```

This communicates:
- current level;
- current XP;
- progress towards the next level.

---

### 2.2 XP Reward Feedback

After a meaningful learning activity, the learner can receive short feedback such as:

```text
+20 XP

Daily Challenge completed
```

or:

```text
+100 XP

Module completed
```

Reward feedback should be brief and should not interrupt the learner's flow.

---

### 2.3 Meaningful XP Sources

| Activity | UX Treatment |
|---|---|
| Pass a learning-module assessment | Larger XP reward |
| Complete the Daily Quantum Challenge | Standard XP reward |
| Complete a major learning milestone | XP and possible badge |
| Repeat an already completed activity | No additional completion reward, or limited reward depending on agreed rules |

XP should reward meaningful learning outcomes rather than repeated clicking or farming completed content.

---

## 3. Badge and Achievement UX Concept

Badges can complement XP by recognising important learning milestones.

Example:

```text
ACHIEVEMENT UNLOCKED

Quantum Starter

Completed your first learning module.

+100 XP

[ Continue ]
```

### Example Achievements

```text
Quantum Starter
Complete your first module

BB84 Explorer
Complete the core BB84 learning pathway

Challenge Accepted
Complete your first Daily Challenge

Secure Channel
Successfully complete the BB84 assessment
```

Badges should represent genuine learning milestones.

---

## 4. Dashboard Integration Concept

Daily Challenges, XP, module progress, and achievements can be combined into one learner dashboard.

```text
Welcome back, Jerome

LEVEL 3                       420 / 600 XP
████████████████░░░░░░░░

CONTINUE LEARNING
Module 3: Alice, Bob and Key Sifting
Progress: 60%
[ Continue ]

DAILY QUANTUM CHALLENGE
BB84 Basis Matching
Beginner · +20 XP
[ Start Challenge ]

RECENT ACHIEVEMENTS
◉ Quantum Starter
◉ Challenge Accepted
```

The dashboard should clearly support three learner goals:

1. Continue the structured learning pathway.
2. Practise through the Daily Quantum Challenge.
3. Review progress and achievements.

---

## 5. UX Principles

The Daily Challenge and XP experience should follow these principles:

- Keep structured BB84 learning as the main pathway.
- Use Daily Challenges as optional reinforcement and practice.
- Make progress visible and understandable.
- Provide immediate, contextual feedback.
- Explain why answers are correct or incorrect.
- Keep terminology beginner-friendly.
- Avoid unnecessary technical complexity.
- Use XP and badges to recognise meaningful learning progress.
- Avoid rewarding meaningless repeated actions.
- Make hints supportive without giving away the answer.
- Keep reward animations and celebrations brief.
- Ensure learners always understand what to do next.

---

## 6. Relationship to the Learning Journey

The intended relationship between the core learning flow and gamification is:

```text
Structured Learning Module
        |
        v
Complete Learning Activity
        |
        v
Assessment / Meaningful Milestone
        |
        +----> XP / Badge Feedback
        |
        v
Continue Learning

Daily Challenge
        |
        v
Apply Previously Learned Concept
        |
        v
Immediate Feedback
        |
        +----> XP Reward
        |
        v
Return to Learning Pathway
```

Daily Challenges and XP should therefore support the learner's progression through Crack the Channel rather than becoming separate or competing experiences.
