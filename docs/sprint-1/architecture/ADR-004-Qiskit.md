# 004 Qiskit Service Isolation
**Date:** 23.08.26
**Status:** Pending - on Team approval
**Last Edit:** 26.09.26, Mackenzie Selleck

## Context
Crack the Channel's core feature, BB84 key exchange, requires running real Qiskit circuits. To run Qiskit safely, it is suggested to contain it within its own virtual environment. Qiskit is also a Python library and requires an extensive amount of additional Python libraries to run all needed features. The rest of the stack decided in ADR 0001  is JavaScript/TypeScript based, therefore this decision covers both how Qiskit is run and how it is isolated from the rest of the application.

## Options Considered
- Option A: Run Qiskit as a separate, containerised microservice (FastAPI + Aer, packaged with Docker), called over HTTP by the Next.js API routes
- Option B: Run Qiskit by rewriting the backend as a Python framework (e.g. Django), so Qiskit is just a library import
- Option C: Run Qiskit as a plain Python process on the same host as the rest of the application, without containerisation

## Decision
A separate FastAPI + Aer service, packaged in Docker and deployed independently from the rest of the stack

## Rationale
Option B would mean the team would have to build a backend and incorporate Flask in order to maintain a React frontend. This, again, would take necessary time away from focusing on the key features and requirements of the project build. Plus, incorporating Qiskit into the framework doesn’t meet the necessary standards of the library which state that it should be contained within a separate environment. Option C was also rejected because it does not meet the separate environment for safety requirement either. 

Option A was chosen because Docker directly provides the isolation needed to use Qiskit safely. It will also allow the team to cap memory and CPU, deny outbound network access and pin its Python/Qiskit/Aer dependency versions to make it easy for all users to run.

## Consequences
The Qiskit service is a secondary deployable alongside the main Next.js/Supabase stack. Therefore the team will have to maintain a Dockerfile, a separate deployment and an HTTP contract between the agent orchestration layer and this service, rather than a single deployable application. This, however, will ensure that anything triggered by the AI agent or user will run inside a sandbox so a malformed or oversized circuit request affects only the Qiskit service, not the main application.

## Revisions
The core decision of a separate Dockerised microservice is still being used. Further revisions have been implemented expanding the scope of the microservice and its role within the project.

| # | Date | Change | Reason | Related |
|---|---|---|---|---|
| 1 | 26.09.26 | The service will also be in charge of generating and grading the Daily Challenge tasks by using SymPy and Qiskit | Answers now need to be computed by code due to concerns regarding open source AI competence | ADR 007, ADR 011 |
| 2 | 26.09.26 | The service is stateless and callable via an internal API key | This ensures database credentials are kept out of the sandbox | ADR 009, ADR 013 |


### Revision 1: Challenge generation and grading added to microservice
**What changed:** Originally the microservice would be used to executed circuits. Now it will also generate Daily Challenge problems, computes answers, grades submissions and identify user error through `POST /challenges/generate` and `POST /challenges/grade`.
**Why:** ADR 007 moved answer computation from the LLM to code because open-source models could potentially make maths errors that beginners are likely to miss. This ype of logic needs both Qiskit and SymPy which are only available through Python. Adding this content to the microservice keeps all Python code in one sandbox
**Impact:** The service now becomes a larger part of the project and therfore will need further testing. The isolation benefits of dockerisation will also be able to protect grading.

### Revision 2: Stateless and internal authentication
**What changed:** The icroservice won't have database access or user accounts. Every endpoint except  for`/health` will need an internal API key held securely.
**Why:** The generate endpoint will return answers, so it can never be callable via the browser. Ensuring database credentials are kept out of the microservice will keep a compromised sandbox from accessing user data.
**Impact:** The internal API key must be stored as a secret and rotated if a leak ever occurs. Details in ADR 009.

