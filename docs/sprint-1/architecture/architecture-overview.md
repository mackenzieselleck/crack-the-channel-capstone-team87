# Architecture Overview

This document describes the full architecture of Crack the Channel. This document should be updated in the event of changes or additions to the site's stack. Whenever a component, technology, or interaction changes, this document should be updated within the same PR as the change, to ensure the overview remains up to date with the site’s current architecture.

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

### Supabase (Backend/Database/Auth):
Supabase will provide both authentication (login, password handling, session management) and Postgres database (user accounts, lesson progress, badges, streaks, leaderboard data) as a managed service. A BaaS was chosen to manage user data and authentication so that the team could focus build effort on the core design features of the site: the AI Agent, the QKD/encryption logic and Qiskit integration, rather than on implementing authentication and data access from scratch

### Qiskit:
The Qiskit service will be a separate FastAPI application running Qiskit's Aer simulator, packaged in Docker and deployed to Render. This is the only component that executes Qiskit code and it is deliberately isolated from the rest of the stack. This is due to the fact that Qiskit is based in Python and because the service will need to execute agent generated and user submitted circuits and therefore will need to run inside a sandboxed environment to mitigate risk

### External APIs and Services:
Anthropic's Claude API will be used for the AI Agent. It will be called via the Agent Orchestration Layer, not directly from the browser. This ensures that the API key is never exposed to the client. At this stage, no other external services are required for the core features. Anything further added as extension features will be added to this section only after agreement with the team and client