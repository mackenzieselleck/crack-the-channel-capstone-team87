# 001 Tech Stack
**Date:** 23.08.26
**Status:** Approved
**Last Edit:** 26.09.26, Mackenzie Selleck

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
Choosing a BaaS means the team does not control user authentication or the underlying database infrastructure. The team will be dependent on Supabase's availability, pricing and feature set for the entirety of the project. Therefore, if a requirement emerged that Supabase could not support, the team would need to either work around it or migrate. Choosing Next.js over a server-rendered approach means the team takes on a heavy JavaScript, decoupled frontend stack rather than a more simplistic pattern which increases the number of moving parts within the site. This, however, is necessary in ordcer to deliver the interactivity the site requires. Because Qiskit is Python based, this decision doesn’t avoid needing to involve a second language into the stack, this is addressed directly in ADR 004

## Revisions

| # | Date | Change | Reason | Related |
|---|---|---|---|---|
| 1 | 23.09.26 | Change which LLM provider the stack will be implementing for the agent. An open source LLM will be used | This change is due to PI costs and client scope expectations | ADR 005, ADR 006 |
| 2 | 23.09.26 | The microservice scope has expanded to now also include Daily Challenge math generation and grading, through the use of SymPy | As we now have to use open source AI, which can make errors on complicated mathematics, we need a trusted method to compute these tasks | ADR 004, ADR 007, ADR 011 |
| 3 | 26.09.26 | The Qiskit service could be hosted on a RMIT lab server instead of Render | The team has been offered lab server access and Render's lower tier options can have slow first requests | ADR 004, ADR 017 |

### Revision 1: Open source LLM added to the stack
**What changed:** The LLM provider was previously undecided with Claude API as a hopeful placeholder until client approval. The stack has now been confirmed to include an open source LLM which will be accessed via a Next.js API route. 
**Why:** This has been decided due to the overhead cost of high performing LLMs such as Claude and the client's overall expectiations for the project. 
**Impact:** No needed changes to the frontend or Supabase. The LLM endpointwill become another dependency which will be called from the agent orchestration server layer.

### Revision 2: Microservice scope expanded
**What changed:** The Python microservice will now handle Daily Challenge problem generation and grading through the use of SymPy and Qiskit.
**Why:** ADR 007 requires challenge answers to be computed via code instead of the LLM. Due to the complexity of the math Python libraries are the best option, therefore adding these tasks to the existing service will be the most efficient computationally.
**Impact:** Still two languages and two core environments within the stack. The microservice now carries more of the project's core logic, so additional testing and care will need to be taken with the environment.

### Revision 3: Hosting options for the Microservice
**What changed:** The Microservice has the option to run on a lab server, with Render kept as the baseline.
**Why:** The team has access to a lab server that can run the service, this could avoid Render's slow first requests.
**Impact:** Dependent on RMIT IT and Team approval. Full details and impact has been recorded within ADR 017.