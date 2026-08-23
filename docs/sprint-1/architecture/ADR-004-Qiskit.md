# 004 Qiskit Service Isolation
**Date:** 23-08-2026
**Status:** Pending - on Team and Client approval

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


