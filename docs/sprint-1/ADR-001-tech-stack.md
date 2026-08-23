# 001 Tech Stack
**Date:** 23-08-2026
**Status:** Pending - on Team and Client approval

## Context
Crack the Channel needs a defined stack before development begins, covering the frontend framework, the backend/data layer, and how Qiskit is run. The client brief and site core requirements specify: user authentication, gamification of learning, the involvement of an AI agent and a Qiskit based BB84 simulation. The underlying technology choices were left entirely to the team

## Options Considered
- **Frontend Framework:**
    - Option A: React and Tailwind CSS via Next.js
    - Option B: Vue.js via Nuxt.js
    - Option C: A server-rendered approach (eg: Laravel, or Spring Boot with Thymeleaf)
- **Backend/Database:**
    - Option A: A BaaS (eg: Supabase or Firebase)
    - Option B: A self-built backend (Spring Boot with Spring Security, or Django)
- **Qiskit Execution:**
    - noted here as a constraint on the overall stack and addressed separately in ADR 004

## Decision
Next.js with React and Tailwind CSS for the frontend, Supabase as the backend/data layer and a separate dockerised Python microservice for Qiskit (see ADR 004)

## Rationale
React was chosen over Vue primarily due to its large and varied ecosystem which will help enable an interactive and animated UI to meet site requirements (eg: gamified progress bars, live QBER visualisations, badge unlocks). Next.js will also additionally provide a server layer (API routes) within the same codebase, which the AI Agent orchestration logic will need (see ADR 005).  A server-rendered approach was considered and rejected as Crack the Channel's core requirement is a highly interactive, client-side simulation experience, which a page per request rendering model doesn’t suit.

For the backend/data layer, a BaaS was chosen over a self-built backend to allow the team to focus effort on the AI Agent, the QKD/encryption logic, and the Qiskit integration, not on implementing authentication or security. The choice of backend approach decides how much of the team's effort goes toward infrastructure versus the project’s key requirements. Therefore, a BaaS is ideal for the team’s timeline and build focus. Supabase was chosen over Firebase as its data store is relational Postgres rather than a NoSQL model, which is a better fit for the gamification requirements

## Consequences
Choosing a BaaS means the team does not control user authentication or the underlying database infrastructure. The team will be dependent on Supabase's availability, pricing and feature set for the entirety of the project. Therefore, if a requirement emerged that Supabase could not support, the team would need to either work around it or migrate. Choosing Next.js over a server-rendered approach means the team takes on a heavy JavaScript, decoupled frontend stack rather than a more simplistic pattern which increases the number of moving parts within the site. This, however, is necessary in order to deliver the interactivity the site requires. Because Qiskit is Python based, this decision doesn’t avoid needing to involve a second language into the stack, this is addressed directly in ADR 004


