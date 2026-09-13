# Sprint 2 Technical Handover — BB84 Quantum Feature

**Team:** Team 87 — IBM Cyber Security: Quantum Risks
**Project:** Crack the Channel — Interactive QKD (BB84) Learning Platform
**Purpose:** hand the standalone POC's findings to whoever builds the quantum feature in Sprint 2 — what is already proven, what to reuse, what to build, and what to watch out for.
**Read alongside:** `bb84_poc.py` (the POC) · `TECHNICAL-NOTES.md` (dependencies, limitations) · `TECHNICAL-ARCHITECTURE.md` (integration design + data contract)

---

## 1. What is already proven (don't re-investigate)

The POC exists to remove risk from Sprint 2. These questions are answered — build on them rather than re-opening them:

- **Real Qiskit circuits run and produce the right behaviour.** Clean channel ≈ 0% QBER, intercept-resend ≈ 25%.
- **The quantum code cannot run in the browser.** Qiskit is Python with compiled Rust/C++ components; it must run server-side.
- **The shape of the result data is known.** Sifted-key length, QBER, error count, a per-qubit trace, and a key sample — see the data contract in `TECHNICAL-ARCHITECTURE.md §4`.
- **Dependencies are minimal and pinned.** `qiskit==2.5.2`, `qiskit-aer==0.17.2`, Python ≥ 3.10. No hardware, no IBM Quantum account.

## 2. What to reuse vs rebuild

- **Reuse the logic** `build_qubit_circuit()`, `transmit()` and `run_bb84()` in `bb84_poc.py` are the proven core — port them essentially unchanged. The console tables, `draw()` calls, and CLI (`argparse`) are POC scaffolding, not needed for next sprint.

- **Wrap, don't rewrite.** The Sprint 2 job is to put `run_bb84()` behind a stateless Python service (FastAPI) that returns the JSON contract, then have the web backend call it. The architecture doc already specifies this.

## 3. Single non-negotiable constraint

If the AI Bot or a learner circuit-builder is added, the service must **never execute learner- or AI-supplied code** (no `exec()` of circuit strings). Any user/AI circuit must arrive as **validated parameters** — a whitelist of allowed gates and qubit counts that the service turns into a circuit itself. It is far cheaper to design in now than to retrofit. Decide the parameter format before writing the service.

## 4. Decisions Sprint 2 must make (surfaced by the POC's limitations)

The POC's documented simplifications (see `TECHNICAL-NOTES.md §3`) become live product decisions:

- **Noise and the security threshold.** The POC's channel is ideal (0% clean). Decide whether the platform stays clean for simplicity, or adds an optional noise control to teach the realistic ~11% threshold idea. Affects FR-09 and the learning content.
- **Post-processing.** The POC stops at QBER estimationd; its "final key" is not a secure key. Decide whether Sprint 2 teaches error correction / privacy amplification or deliberately keeps the demonstration simplified — and make sure the UI never implies the demo key is secure.
- **Trace payload size.** The per-qubit `trace` powers the step-by-step animation (to visually show the bb84 process) but grows with qubit count. Decide a sensible cap (e.g. animate the first N) so responses stay small (see the contract note in `TECHNICAL-ARCHITECTURE.md §4`).

## 5. Environment and performance notes

- **Python ≥ 3.10 must exist wherever the quantum service is hosted.** should be checked with the still-open hosting decision (e.g. RMIT lab servers vs independent domain). Confirm during upcoming tech advisor meeting. 
- **Performance is fine at demo scale.** One circuit per qubit handles a few thousand qubits comfortably. Only batch into fewer circuits if a use case needs much larger exchanges.

## 6. Suggested build sequence

A rough order that keeps each step demonstrable:

1. Wrap `run_bb84()` in a FastAPI endpoint returning the JSON contract; test it in isolation exactly as the POC is tested currently.
2. Have the web backend call that endpoint (server-to-server), attaching learner context and recording progress.
3. Render the result in the frontend: QBER, verdict, and the per-qubit trace as the teaching visualisation.
4. Add the Eve toggle end to end and confirm the QBER visibly responds.
5. Resolve the §4 decisions (noise/threshold, post-processing, trace cap) and fold them into the content.

---

## 8. Traceability

| Handover concern | Requirements |
|---|---|
| Reuse proven Qiskit core | FR-04, NFR-03, BR-03 |
| Eve / QBER feature | FR-08, FR-09, US-11–US-13 |
| Controlled execution constraint (§3) | NFR-09, NFR-10, BR-10 |
| Hosting / environment (§5) | NFR-05, and the open hosting decision |
| Performance (§5) | NFR-02 |
| "POC ready to guide Sprint 2" (checklist item 6) | this document |
