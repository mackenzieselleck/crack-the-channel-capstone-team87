## Qiskit BB84 service

The Python/FastAPI service described in ../docs/sprint-1/bb84-poc/TECHNICAL-ARCHITECTURE.md. It wraps the standalone POC's proven BB84 logic (bb84_poc.py) behind an HTTP endpoint the Next.js backend calls, and adds key post-processing.

This service is stateless and internal-only: no auth, no database, no user data. It takes validated parameters in, and returns a JSON result. It is reached only by the Next.js backend, never directly by the browser.

## Decisions: channel noise & post-processing

*Channel noise:* kept ideal (0% QBER with no eavesdropper), matching the POC. No noise model was added. This limits the teaching point to just eavesdropping as a cause of error, rather than also introducing the ~11% real-world security threshold. Can be revisited later as an optional add-on without breaking anything, since it's additive. 
*Post-processing:* required, and implemented. Even on an ideal channel, an active eavesdropper still injects real bit errors into the sifted key — that's one of the platform's two core teaching modes (Eve on/off). Presenting the raw sifted bits as "the key" is misleading, so error correction + privacy amplification (below) were built to actually produce a reconciled, compressed key instead.


## Structure

```
qiskit-service/
├── app/
│   ├── bb84.py            # Qiskit circuit + BB84 exchange logic (ported from bb84_poc.py)
│   ├── postprocessing.py  # Error correction (Cascade-style) + privacy amplification
│   ├── schemas.py         # Request/response models
│   └── main.py            # FastAPI app, POST /bb84/run, GET /health
├── tests/                 # pytest unit tests for all three modules above
└── requirements.txt
```

## Setup & run

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
| `seed` | int \| null | null | fixes both the classical bit/basis choices *and* the quantum measurement outcomes, for a fully reproducible run |
| `block_size` | int | 4 | error-correction block size (1–64) |
| `security_parameter` | int | 32 | extra bits shaved off during privacy amplification as a safety margin |
| `trace_limit` | int | 50 | max per-qubit trace rows returned (0–500), so large exchanges don't balloon the payload — see `TECHNICAL-ARCHITECTURE.md` §4 |

The request body is a small, fully-validated set of numeric/boolean
parameters — nothing here is ever interpreted as code or an arbitrary
circuit description. That satisfies the "no learner/AI code execution"
constraint in `SPRINT2-HANDOVER.md` §3: any future learner- or AI-built
circuit must still arrive as constrained parameters like these, not as a
string this service `exec()`s.

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

- `final_key_preview` / hidden field it's derived from — the *sifted* key
  before post-processing (this is what the original POC called its "final
  key", and its own docs are explicit it is **not** secure — see below).
- `error_correction` / `secure_key_preview` / `secure_key_length` — the new
  post-processing output. When QBER is high (as above, with an active
  eavesdropper), the secure key can shrink to **zero bits** — that's
  correct: it means privacy amplification determined there isn't enough
  uncompromised entropy left to safely extract a key, which is the whole
  point of running it.

### `GET /health`

Returns `{"status": "ok"}`. Used for readiness checks.

## Key post-processing — what was added and why

The POC stops at QBER estimation: its "final key" is just the leftover sifted 
bits, which is not a cryptographically secure key (`TECHNICAL-NOTES.md` §3, 
"No post-processing"). This service adds the two steps real BB84 needs to 
actually produce one, implemented in `app/postprocessing.py`:

### 1. Error correction (reconciliation)

BB84 example: an eavesdropper or channel noise, leaves Alice and Bob 
holding sifted keys that don't match. Before they can use the key 
for anything, they need to agree on identical bits.

We implement a **single-round, simplified Cascade protocol**
(`cascade_reconcile`):

1. Split both keys into fixed-size blocks (`block_size`, default 4 bits).
2. For each block, publicly compare parity (XOR of the block's bits — not
   the bits themselves).
3. If parities disagree, binary-search that block down to the one bit that
   differs (recursively comparing sub-block parities), then flip Bob's bit
   to match Alice's.
4. Every parity bit compared this way is public information Eve could also
   see, so it's counted as `leaked_bits` and later subtracted from the
   secure key length.

This is a simplification of real Cascade (which runs multiple
passes with shuffled block orderings to also catch blocks with an even
number of errors, which cancel out in a single parity check). One round is
enough to correct the sparse, mostly-single-bit errors this platform's QBER
range produces, and keeps the algorithm easy to explain and to test. Any
bits still mismatched after the pass show up as `residual_mismatches`.

### 2. Privacy amplification

Even after reconciliation, an eavesdropper who intercepted qubits (or
listened to the parity bits above) has some information about the key.
Privacy amplification compresses the reconciled key into a shorter one that
information is a negligible fraction of.

We implement **universal hashing via a random Toeplitz matrix over GF(2)**
(`privacy_amplification` / `_toeplitz_hash`), the standard practical
construction for this step: output bit `i` is the XOR of a pseudorandom
subset of the input bits, chosen from a random binary string.

The output length is computed by `secure_key_length`:

```
output_length = clamp(
    floor(input_length * (1 - h2(qber))) - leaked_bits - security_parameter,
    0, input_length
)
```

`h2` is the binary (Shannon) entropy function — `h2(qber)` estimates the
fraction of the key Eve could plausibly know given the observed error rate,
so `1 - h2(qber)` is roughly what's left. `leaked_bits` accounts for the
parity bits spent on error correction, and `security_parameter` (default
32) is a fixed extra safety margin.

**This is a simplified, illustrative bound for a teaching platform** — it
captures the right shape (higher QBER or more leakage shrinks the key,
sometimes to zero) but is not a substitute for a formal finite-key security
proof. The UI should still make clear this demonstrates the idea of
privacy amplification, not a production-grade QKD implementation.

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
