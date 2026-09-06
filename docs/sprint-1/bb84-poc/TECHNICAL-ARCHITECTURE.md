# Initial Technical Architecture — Qiskit BB84 Integration

**Team:** Team 87 — IBM Cyber Security: Quantum Risks
**Project:** Crack the Channel — Interactive QKD (BB84) Learning Platform
**Scope of this document:** how the standalone Qiskit BB84 proof-of-concept will later connect to the web application. It documents the technical approach; it does not integrate the POC into the product.
**Companion artifact:** `bb84_poc.py` (the standalone POC) · `SAMPLE-OUTPUT.txt` (its run output)

---

## 1. Proof of Concept 

The POC (`bb84_poc.py`) proves the quantum half of the platform works, the demonstration shows real Qiskit circuit execution, runs a full BB84 key exchange, and the QBER can be visibly seen to jump from ~0% to ~25% when an eavesdropper is present. This document reasons about the path from that standalone script to a feature inside the web product.

As the POC is standalone it is not implemented into the web app and it does not have a server or database. The POC will be used to de-risk the quantum logic in isolation, and the integration is designed on paper first so we commit to a shape before writing production code. When integration occurs, the logic in the POC can be used, the script itself does not ship as-is.

---

## 2. Why Qiskit forces a client–server boundary

As Qiskit is a Python library, Python can be used for writing Qiskit logic into the web app however Qiskit is not pure Python, it consists of a compiled Rust core as well as the `qiskit-aer` simulator written in C++. Aer is a specific component which allows simulation of a quantum computer and needs to be installed independently (refer to README.md). Due to Qiskit's composition it cannot run reliably in a browser (browser Python via WebAssembly does not include Qiskit's compiled components). To create executable Qiskit circuits the code is required to run on a Python server rather than directly in a user's browser. Consequently the BB84 simulation cannot exist inside the browser app and must be a separate program.

---

## 3. Target architecture

```
   Browser (web frontend)
        │  user runs a BB84 exchange / toggles Eve
        ▼
   Web application backend  ── auth, accounts, progress, gamification, AI Bot
        │                      (Supabase for auth + data)
        │  HTTP request: run BB84 with these parameters
        ▼
   Qiskit service  (Python / FastAPI)   ◄── the POC's logic is used here
        │  builds & runs real Qiskit circuits on Aer
        ▼
   returns structured results (JSON): sifted length, QBER, key sample, per-qubit trace
```

- **Frontend** — everything the learner interacts with: orientation, Alice/Bob/Eve panels, the QBER visualisation, plain-language feedback, dashboards.
- **Web backend** — accounts, persistent progress, gamification state, and the AI Bot. Auth and data use Supabase so that password security is provided and team does not need to write login/password handling. 
- **Qiskit service** — run BB84 circuits and return results. It is stateless — it knows nothing about users or progress. This keeps the quantum code simple and independently testable, and means it can be developed, deployed, and scaled on its own.

---

## 4. Frontend / backend / Qiskit interaction 

1. The learner triggers an exchange in the browser (e.g. "Run BB84", Eve on/off, choose a qubit count).
2. The frontend calls the web backend, (not the Qiskit service directly). Only the backend talks to Qiskit, this keeps the quantum service off the public internet, lets the backend attach the learner's context, and records progress/XP from the result.
3. The web backend makes a server-to-server call to the Qiskit service with the exchange parameters.
4. The Qiskit service runs the circuits and returns structured JSON.
5. The backend records any progress/gamification outcome (Supabase) and passes the result back to the frontend.
6. The frontend renders the QBER, the key, and the learning explanation.

### Proposed data contract

Derived directly from the POC's `run_bb84()` output, so the interface is already proven to be producible:

**Request** (backend → Qiskit service)
```json
{ "num_qubits": 200, "eavesdrop": true, "seed": 42 }
```

**Response** (Qiskit service → backend)
```json
{
  "num_qubits": 200,
  "eavesdrop": true,
  "sifted_key_length": 100,
  "qber": 0.20,
  "sample_size": 50,
  "errors": 10,
  "eavesdropping_detected": true,
  "final_key_preview": "010000011110111011101101",
  "trace": [
    { "alice_bit": 0, "alice_basis": "+", "bob_basis": "+",
      "bob_result": 0, "kept": true, "eve_basis": "x" }
  ]
}
```

The `trace` array feeds the step-by-step teaching UI (per-qubit rows, the sifting animation, highlighting where Eve's guesses caused errors). It is optional and can be capped or omitted for large exchanges to keep payloads small. In this case the actual result and QBER will still be displayed however some visuals may be omitted.

### Why a stateless HTTP boundary

- There is one Python dependency, by isolating the Qiskit code in its own service the rest of the stack is not required to be done in Python and can be whatever was chosen in the frontend spike.
- Being stateless allows the Qiskit service to only require parameter input for it to give a result so it can be ran and tested independently without the need for setting up accounts, database, frontend or the whole app. It can also be deployed or updated by itself without redeploying everything else 
- There are no accounts, passwords or progress stored in the Qiskit service which keeps it more secure. The service is internal-only, reached solely by the backend rather than the browser and holds no user data, reducing what an attacker could reach. 

---

## 5. Key technical considerations and risks

**Per-qubit vs batched circuits** The POC builds one circuit per qubit for clarity, and runs 2000 qubits comfortably. If larger exchanges are ever needed, qubits can be batched into fewer circuits. This is not a blocker and can be a later optimisation.

**Controlled execution if learners or the AI build circuits** A past supervisor meeting raised letting learners create basic circuits, and the current scope includes an AI Bot. Both imply circuits that did not come from our own code. Since AI-generated code is required to not be executed as unrestricted code, and Qiskit execution must go through an approved, controlled pathway, architecturally that means the Qiskit service must never `exec()` arbitrary strings. Any learner/AI "circuit" must be expressed as constrained, validated parameters (e.g. a whitelist of allowed gates and qubit counts) that the service turns into a circuit itself, this restricts the attack surface to data and not code. This shapes the service's API design before we build it.

**Stateless service, state in the backend** Progress, XP, and achievements persist in Supabase via the web backend. The Qiskit service returns results and forgets them.

**Graceful degradation** The requirements state an AI-service failure must not block core learning. The same principle applies to the Qiskit service: the frontend and backend should handle its unavailability with a clear message rather than a broken page. Core content and navigation should not depend on it being up.

**Deployment must run Python (hosting).** Wherever the platform is hosted, the environment must support a Python service (Qiskit + Aer). If the chosen host cannot, the Qiskit service is deployed separately and the backend calls it across the network. This should be confirmed against the hosting decision.

---

## 6. Migration path: POC → service

What carries over and what to change during integration:

| current POC (standalone) | Becomes (integrated, later sprint) |
|---|---|
| `run_bb84()` returning a Python dict | The same logic behind a FastAPI endpoint returning JSON |
| `build_qubit_circuit()` / `transmit()` | Unchanged — this is the proven core, reused verbatim |
| Console tables and `draw()` output | Dropped; the frontend renders from the `trace` data instead |
| CLI `--qubits` / `--seed` | Become request parameters |
| No auth / no persistence | Added by the web backend |

The quantum logic is stable and reusable; integration adds a thin API layer around it and leaves accounts, progress, and UI to the parts of the system built for them.

---

## 7. Traceability

| Requirement | Addressed by |
|---|---|
| FR-04, NFR-03, BR-03 (executable Qiskit) | Proven in the POC; preserved as the core of the Qiskit service |
| FR-08, FR-09 (Eve, QBER feedback) | Demonstrated: QBER 0% → ~25%; surfaced via the data contract (§4) |
| FR-12, NFR-07, NFR-11 (auth, persistence) | Assigned to the web backend + Supabase, kept out of the stateless Qiskit service |
| FR-16, NFR-08, BR-09 (AI Bot, resilience) | Degradation principle applied to the Qiskit service (§5) |
| NFR-09, NFR-10, BR-10 (controlled execution) | Parameter-only API; no arbitrary code execution (§5) |
| NFR-02 (reliability/performance) | Per-qubit approach validated at n=2000; batching noted as future option |

