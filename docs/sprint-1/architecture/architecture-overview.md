# Architecture Overview

This document describes the full architecture of Crack the Channel. This document should be updated in the event of changes or additions to the site's stack. Whenever a component, technology, or interaction changes, this document should be updated within the same PR as the change, to ensure the overview remains up to date with the site’s current architecture.

## Change Log
Each change to this document is recorded. This record must include what has been changed, why and any related ADRs. Any scope changes to previous ADRs are also recorded within the original.

| Date | Section | Change | Reason | Related |
|---|---|---|---|---|
| 27.09.26 | architecture diagram | The LLM is now an open source model. This replaced the Claude API placeholder | Client scope change requiring the use of an open source LLM | ADR 005, ADR 006 |
| 27.09.26 | Agent Orchestration Layer | Included descriptions of the two AI uses: the Daily Challenge fixed workflow and the tool calling tutorextension | Daily Challenge generation follows fixed steps as open source models are less reliable | ADR 005, ADR 008, ADR 011 |
| 27.09.26 | Qiskit | The service now also generates and grades Daily Challenges by adding in SymPy | Answers must be computed by code to reduce the sandbox's attack surface and keep answers away from client | ADR 004, ADR 009 |
| 27.09.26 | Dependencies | Added `openai` | Client library for an OpenAI compatible LLM endpoint | ADR 006 |

## Website Requirements and Considerations
- Basic user authentication and security protocols (eg: login, password salting, user profile retention)
- Gamified learning: badges, progress bars, streaks, leaderboards
- Maintain user retention
- Quantum Learning fundamentals: we need to teach users in plain language, visual and interactive learning, with a step by step feel
- Incorporation of an AI Agent: The client has suggested we incorporate an AI agent into the website to potentially assist in guiding the user or help with generating challenges for the user
- Incorporate the use of Qiskit: Qiskit is ran using python and should be ran in a separate environment for safety
- BB84 simulated key exchange with eavesdrop: we must incorporate a simulation of a BB84 key exchange with an eavesdropper. This should be done in an entertaining, interactive and informative manner. We should allow users to be both the key exchangers and the eavesdropper so that they can try the entire process. The process should walk the user through it and explain the complexity in a clear manner that isn’t overbearing

## Architectural Pattern
Crack the Channel’s frontend is a client-rendered Next.js application with Tailwind CSS. Its data and authentication layer will be managed via BaaS, Supabase. The current pattern fits to a client server split architecture across a BaaS and a dedicated Qiskit microservice. 

### Role Breakdown
| Role | Choice |
|---|---|
| UI layer | Next.js components rendered in browser. The browser builds the page from data fetched via API calls, rather than receiving a finished HTML page per request. Tailwind CSS will be used to render page UI to ensure a visually appealing and engaging website design |
| Orchestration layer | Next.js API routes will receive requests from the UI layer. They will then decide whether to call Supabase, the AI Agent, or the Qiskit service, and return an assembled result |
| Data / authentication layer | Supabase (Postgres + Auth) will maintain all necessary user data. All database migration will be done through Supabase’s dedicated migration functionality |
| Compute layer | The Qiskit service, will be a dedicated, isolated microservice. As Qiskit should be detached within its own environment  and is dependent on a number of Python libraries, the service will be dockerised and called upon via API |

## Component Descriptions
### Frontend:
The frontend will be a Next.js application using React and Tailwind CSS. It will be rendered client-side within the browser. Page data will be fetched via API routes and Supabase, to then render the UI. This approach was chosen to best fit core requirements of the site: gamified learning, BB84 simulation with live visual feedback (QBER spikes, badge unlocks, animated photon exchange) and consistent user interaction. Therefore, this framework allows for client-side interactivity rather than constant page reloading after every action

### Agent Orchestration Layer:
Next.js API routes sit between the UI and the rest of the backend. This is where the system will hold prompts and tool definitions for the AI Agent, call the Agent’s API, and execute the tools via HTTP request. This layer provides agent coordination with the site and Qiskit microservice but ensures separation from them for security purposes

The AI is used in two ways (see ADR 008):
- **Daily Challenge (fixed workflow):** when a user opens the Daily Challenge and chooses a difficulty tier the orchestration layer will choose a random category which will be seeded by user, date and tier so it can't be rerolled. It then calls the microservice to generate the problem, and asks the LLM to write the challenge text. This will fallback to a template text if the LLM is slow to respond or unavailable. Submissions are then graded by the microservice (or directly, for module multiple choice questions). The LLM then rephrases the grader's feedback. Answers are then stored in a table that user's won't be able to read (see ADR 011).
- **Ask the Tutor (tool calling agent):** the LLM chooses structured tool calls with validated parameters, as described in ADR 005.

### Supabase (Backend/Database/Auth):
Supabase will provide both authentication (login, password handling, session management) and Postgres database (user accounts, lesson progress, badges, streaks, leaderboard data) as a managed service. A BaaS was chosen to manage user data and authentication so that the team could focus build effort on the core design features of the site: the AI Agent, the QKD/encryption logic and Qiskit integration, rather than on implementing authentication and data access from scratch

### Python Microservice:
The Qiskit service will be a separate FastAPI application running Qiskit's Aer simulatorand SymPy, packaged in Docker and deployed to Render. This is the only component that executes Qiskit code and it is deliberately isolated from the rest of the stack. This is due to the fact that Qiskit is based in Python and because the service will need to execute user submitted circuits and therefore will need to run inside a sandboxed environment to mitigate risk.

The service also handles all Daily Challenge logic. It will generate each problem from a seed, compute the correct answer, grade user submission and identify any user mistake (see ADR 007 and ADR 009). It will be stateless, have no database access, and can only be called via the orchestration layer using an internal API key.

### External APIs and Services:
An Open AI will be used for the AI Agent and is still to be determined. It will be called via the Agent Orchestration Layer, not directly from the browser. This ensures that the API key is never exposed to the client. At this stage, no other external services are required for the core features. Anything further added will be included in this section after agreement with the team and client

### Dependecies
All current dependecies and their versions can be found in the `package.json` file within the boilerplate. Please update if new dependencies are added
- react Turnstile
- react-webgl2
- supabase/ssr
- supabase/supabase-js
- lucide-react
- next
- react
- react-dom
- zod
- tailwindcss/postcss
- types/node
- types/react
- types/react-dom
- eslint
- typescript
- supabase
- tailwindcss
- openai



### Arcitecture Diagram

``` mermaid
flowchart TB
 subgraph BROWSER["Browser"]
        UI["Crack the Channel UI<br>Next.js React + Tailwind"]
  end
 subgraph APP["Next.js - API Routes"]
        ROUTES["API Routes<br>Request Handling"]
        AGENT["Agent Orchestration<br>Tool Definitions"]
  end
 subgraph SUPABASE["Supabase - Managed BaaS"]
        AUTH["User Auth"]
        PG[("Postgres<br>Users + Learning Progress + Badges")]
  end
 subgraph QISKIT["Qiskit Service · Docker · Render or lab server"]
        FASTAPI["FastAPI"]
        AER["Aer Simulator + SymPy<br>Challenge generate / grade"]
  end
 subgraph LLM["Open-source LLM · OpenAI-compatible endpoint"]
        LLMAGENT["AI Agent<br>Text generation + structured tool calls only"]
  end
    ROUTES --> AGENT
    AUTH --> PG
    FASTAPI --> AER
    UI -- Requests and forms --> ROUTES
    ROUTES -- Rendered UI / JSON --> UI
    ROUTES -- Auth and queries --> AUTH
    AGENT -- run_circuit --> FASTAPI
    FASTAPI -- Results --> AGENT
    ROUTES -- Agent calls --> LLMAGENT
    ROUTES -- Generate / grade challenges --> FASTAPI

    style UI stroke:#9b36ff
    style ROUTES stroke:#ff50ed
    style AGENT stroke:#ff50ed
    style AUTH stroke:#52bfff
    style PG stroke:#52bfff
    style FASTAPI stroke:#54ffa4
    style AER stroke:#54ffa4
    style LLMAGENT stroke:#fef84c
    style BROWSER stroke:#9b36ff,fill:#e7b3ff
    style APP stroke:#ff50ed,fill:#feb9fe
    style SUPABASE stroke:#52bfff,fill:#baf6ff
    style QISKIT stroke:#54ffa4,fill:#bbffd9
    style LLM stroke:#fef84c,fill:#FFF9C4
```
Architecture Diagram made with Mermaid