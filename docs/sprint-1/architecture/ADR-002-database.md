# 002 Database
**Date:** 23-08-2026
**Status:** Pending - on Team and Client approval

## Context
Crack the Channel needs a data store that can handle user accounts, lesson progress and gamification data (XP, badges, streaks). ADR 001 established Supabase as the backend/data layer due to the decisions within this ADR

## Options Considered
- Option A: Postgres provided directly by Supabase, using standard relational tables and foreign keys (users, progress, badges, streaks, leaderboard entries)
- Option B: A NoSQL/document database provided directly by Firebase
- Option C: A separate relational database created and ran by the team using MySQL (or equivalent) and a migration tool like Flyway

## Decision
Postgres provided by Supabase, using Supabase's own migration tooling

## Rationale
Gamification features like leaderboards and streak tracking are relational entities. Postgres is able to provide these kinds of results with standard SQL. Firebase’s document model would require either restructuring data or introducing a secondary relational database purely for gamification which would ultimately add unnecessary work. 

Option C, would draw the team’s focus towards schema creation, backend building and user authentication measures which would take necessary time away from the key deliverables for the project. Therefore, this option was ultimately rejected.

## Consequences
Using Supabase's Postgres means the team will get relational integrity (foreign keys between users, progress, and badges) and straightforward SQL for gamification queries. The team will also have to learn and use Supabase's own migration workflow, which will introduce a natural learning curve into the development process.