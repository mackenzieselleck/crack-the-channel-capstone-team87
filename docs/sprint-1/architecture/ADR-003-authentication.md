# 003 Authentication
**Date:** 23-08-2026
**Status:** Pending - on Team and Client approval

## Context
Crack the Channel needs user accounts and login, along with baseline security practices (password salting/hashing and secure session handling). The site’s requirements specifically call for basic user authentication and security protocols. However, the team's ultimate priority is to spend build effort on the AI Agent, QKD/encryption logic, and Qiskit integration, not on implementing authentication from scratch.

## Options Considered
- Option A: Supabase Auth, included as part of the BaaS, providing hosted sign-up/login, password hashing, session/token management, and password-reset flows via SDK calls
- Option B: Firebase Auth, a comparable hosted auth service, requiring Firebase to be adopted as the backend/data layer instead of Supabase
- Option C: Spring Security or Django's built-in auth system,  mature, self-hosted authentication libraries requiring the team to run a Java or Python backend rather than a BaaS

## Decision
Supabase Auth

## Rationale
Option C would provide solid security but would require the team to run a self-hosted Java or Python backend which would introduce infrastructure overhead and a greater time and focus needed from the team to develop the site’s backend and authentication layer. Option B, Firebase Auth, is comparable in effort and security to Option A, but was not chosen because of Firebase’s data layer, which ADR 002 rejected in favour of Supabase's Postgres. Supabase Auth was chosen because it delivers the same benefit as the alternatives while remaining a part of the platform already selected for the database.

## Consequences
The team is not implementing its own password hashing and session handling which reduces both effort and security risk. However, this also means that the team will have limited ability to customize authentication beyond what Supabase Auth's provides. If a requirement were to emerge that Supabase Auth can’t support, the team would need to find a workaround.