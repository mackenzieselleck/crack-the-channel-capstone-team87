# 014 Daily Challenge Attempts, XP and Streaks
**Date:** 27.09.26
**Status:** Pending - on Team and Client approval

## Context
The client requires gamified learning and mechanics that ensure user retention. ADR 002 stores XP, streaks and progress data within Supabase Postgres. The Daily Challenge needs rules that reward effort and difficulty.

## Options Considered
- Option A: Unlimited attempts, with XP calculated within the browser
- Option B: Limited attempts, with XP and streaks calculated through the use of a database function that only the server can call

## Decision
Option B.
- A maximum of **3 attempts** per challenge tier will be allowed. The worked solution is revealed only once the user is correct or out of attempts.
- **XP = max(10, tier × 50 − hints used × 10 − (attempt − 1) × 15)**, so a correct answer always earns some XP but attempts and hints used will deduct XP.
- The **streak** increases once per day when a a user solves any tier of the Daily Challenge. Solving another tier on the same day adds XP only but doesn't further increment the user's streak. Missing a day will reset the user's current streak, and their best streak will be kept.
- Updates will be made by implementing a `record_daily_solve` Postgres function, which only the service role will be able to execute.

## Rationale
Option A encourages the user to keep guessing, especially on multiple choice questions and allows XP to be manipulated from the browser. Option B rewards harder tiers, discourages guessing and ensures that rules are enforced server side.

## Consequences
The rules are simple to explain and cannot be altered from the browser. They can also be tuned after usability testing. The hint penalty will rely on trust until hint reveals are tracked server side (ADR 011). A "streak freeze" mechanic will need to be implemented.
