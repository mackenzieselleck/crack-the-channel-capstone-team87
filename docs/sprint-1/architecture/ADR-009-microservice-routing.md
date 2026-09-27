# 009 icroservice Role and API Routing
**Date:** 26.09.26
**Status:** Pending - on Team and Client approval


## Context
ADR 004 isolated Qiskit in a Dockerised FastAPI + Aer service called over HTTP. ADR 005 then defined a `run_circuit` tool for gent use. ADR 007 has shifted scope to now require the service to generate and grade challenges using Qiskit and SymPy. The team must decide how much logic the service will own, what state it holds, and who can call it, particularly because it is sandboxed for security purposes and the generation endpoint will now return answers.

## Options Considered
- Option A: The service only exposes a generic `run_circuit` endpoint. Challenge logic is written in TypeScript within the orchestration layer
- Option B: The service owns all challenge logic and calls are done through specific endpoints. The service has access to Supabase to read and write challenges and attempts
- Option C: TThe service owns all challenge logic and calls are done through specific endpoints. The service is kept **stateless**, with no database access. 

## Decision
Option C. The service will expose `POST /challenges/generate` (category, seed, tier -> challenge and answer), `POST /challenges/grade` (category, stored answer, submission -> correct, mistake tag, explanation), `GET /challenges/types` and `GET /health`. Every category will implement the same generate/grade contract, so adding another category won't change the orchestration layer. All endpoints will require an `x-api-key` header checked with a constant time comparison. Storage, user data, LLM calls and XP will still remain within the orchestration layer and Supabase. 

## Rationale
Option A would be harder to accomplish without Python libraries and would separate Qiskit based questions from other clalenge tasks Option B would give the service database credentials, which would increase its attack surface and conflicts with ADR 004's aim of environment isolation. Option C keeps one environment for all challenge tasks which is kept sandboxed and separate from sensitive data.

## Consequences
Generation and grading won't ever disagree. The service will be able to be moved between hosts without changing the database. The internal API key will become a sensitive secret that will need to be stored in environment variables and rotated if leaked. Grading will require a network call, so the orchestration layer will need to handle potential timeouts gracefully, as ADR 005 already requires.
