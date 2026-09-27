## Qiskit BB84 service

Python/FastAPI qiskit service. It wraps the standalone POC's proven BB84 logic (bb84_poc.py) behind an HTTP endpoint the Next.js backend calls,
and adds key post-processing. This service is stateless and internal-only: no auth, no database, no user data. It takes validated parameters, 
and returns a JSON result. It is reached only by the Next.js backend.


## Decisions: channel noise & post-processing

*Channel noise:* kept ideal (0% QBER with no eavesdropper), matching the POC. No noise model was added. This limits the teaching point to just eavesdropping as a cause of error, rather than also introducing the ~11% real-world security threshold. Can be revisited later as an optional add-on without breaking anything, since it's additive. 
*Post-processing:* implemented. Presenting the raw sifted bits as "the key" is misleading, so error correction + privacy amplification were built to actually produce a reconciled, compressed key instead.


## Structure

```
qiskit-service/
├── app/
│ ├── bb84.py               # Qiskit circuit + BB84 exchange logic (ported from bb84_poc.py)
│ ├── postprocessing.py     # Error correction (Cascade-style) + privacy amplification
│ ├── schemas.py            # Request/response models
│ └── main.py               # FastAPI app, POST /bb84/run, GET /health
├── tests/                  # pytest unit tests for all three modules above
├── Dockerfile              # Containerised build — see ADR-004-Qiskit.md
├── .dockerignore
└── requirements.txt
```

The service is run inside Docker via `docker-compose.yml` at the repo root (memory/CPU caps and network isolation are configured there, not in the Dockerfile itself. 


## Setup & run

### Option 1: Docker 

```bash
docker compose up qiskit-service
```
This builds and runs the service inside a container. It's reachable at `http://localhost:8000`, same as the venv option below.

### Option 2: Local venv (faster for active development — supports `--reload`)

```bash
cd qiskit-service
python3 -m venv .venv && source .venv/bin/activate   # needs Python >= 3.10
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Try it:

```bash
curl -X POST http://localhost:8000/bb84/run \
  -H 'Content-Type: application/json' \
  -d '{"num_qubits": 500, "eavesdrop": true, "seed": 42}'
```

## Run the tests

```bash
cd qiskit-service
pytest
```

tests covering the BB84 exchange (`test_bb84.py`), error correction and
privacy amplification (`test_postprocessing.py`), and the HTTP API
end-to-end (`test_api.py`). (To be written by another team member)


## API

### `POST /bb84/run`

**Request**

| field | type | default | notes |
|---|---|---|---|
| `num_qubits` | int | 200 | 2–5000 |
| `eavesdrop` | bool | false | simulate an intercept-resend eavesdropper |
| `seed` | int \| null | null | fixes both the classical bit/basis choices and the quantum measurement outcomes, for a fully reproducible run |
| `block_size` | int | 4 | error-correction block size (1–64) |
| `security_parameter` | int | 32 | extra bits shaved off during privacy amplification as a safety margin |
| `trace_limit` | int | 50 | max per-qubit trace rows returned (0–500), so large exchanges don't balloon the payload — see `TECHNICAL-ARCHITECTURE.md` §4 |
| `user_role` | "alice" \| "bob" \| "eve" \| null | null | which role a human learner is playing; the other role(s) are generated as NPCs. Omit for the original fully-automated behaviour |
| `user_bases` | int[] \| null | null | the learner's basis per qubit (0=rectilinear, 1=diagonal). Required, length `num_qubits`, when `user_role` is set |
| `user_bits` | int[] \| null | null | the learner's bit per qubit. Only used when `user_role="alice"` — Bob and Eve measure rather than choose a bit |

**NPC behaviour.** 
By default every role is generated automatically. Setting `user_role` lets 
one role be driven by a user's choices instead: `user_bases`/`user_bits` are
validated (correct length, values must be 0 or 1, `user_role="eve"` requires 
`eavesdrop=true`) and substituted in for that one role. This doesn't change 
how a circuit is built or executed, it only changes where that role's bit/basis
choices come from. 

The request body is a small, fully-validated set of numeric/boolean
parameters, it's not interpreted as code or an arbitrary circuit 
description, to satisfy the "no learner/AI code execution" constraint.

**Response** — the original data contract from `TECHNICAL-ARCHITECTURE.md`
§4, plus the post-processing results:

```json
{
  "num_qubits": 500,
  "eavesdrop": true,
  "sifted_key_length": 239,
  "qber": 0.218,
  "sample_size": 119,
  "errors": 26,
  "eavesdropping_detected": true,
  "final_key_preview": "332c2fa0...",
  "trace": [ { "alice_bit": 0, "alice_basis": "+", "eve_basis": "+", "bob_basis": "+", "bob_result": 0, "kept": true } ],

  "error_correction": {
    "block_size": 4,
    "leaked_bits": 54,
    "corrected_errors": 12,
    "residual_mismatches": 14
  },
  "privacy_amplification": {
    "input_length": 120,
    "output_length": 0,
    "compression_ratio": 0.0
  },
  "secure_key_preview": "",
  "secure_key_length": 0
}
```


### `GET /health`

Returns `{"status": "ok"}`. Used for readiness checks.


## Frontend / backend wiring

`my-app/app/api/simulator/route.ts` forwards the frontend's request body to
this service's `POST /bb84/run` and relays the JSON response back. It reads
the service URL from `QISKIT_SERVICE_URL` (defaulting to
`http://localhost:8000` for local dev), and returns a `503` with a
structured error if the service is unreachable, rather than crashing the
page — the "graceful degradation" principle from
`TECHNICAL-ARCHITECTURE.md` §5 applies to this service the same way it does
to the AI Bot.

To point the Next.js app at this service locally, set in `my-app/.env.local`:

```
QISKIT_SERVICE_URL=http://localhost:8000
```
