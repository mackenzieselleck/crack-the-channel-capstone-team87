# BB84 POC — Technical Notes

**Team:** Team 87 — IBM Cyber Security: Quantum Risks
**Project:** Crack the Channel — Interactive QKD (BB84) Learning Platform
**Artifact:** finalisation notes for the standalone Qiskit BB84 proof-of-concept
**Companion files:** `bb84_poc.py` · `SAMPLE-OUTPUT.txt` · `TECHNICAL-ARCHITECTURE.md` · `SPRINT2-HANDOVER.md`

These notes finalise the standalone POC. They record what it proved, what it depends on, and scope for Sprint 2.

---

## 1. Results (verified)

The POC was executed on a clean environment and behaves as designed. Full console output is captured in `SAMPLE-OUTPUT.txt`; Main results:

| Check | Outcome |
|---|---|
| A single-qubit BB84 circuit builds and runs on the Aer simulator | executes successfully |
| Full key-exchange flow runs (prepare → transmit → measure → sift → estimate QBER → key) | demonstrated |
| Clean channel error rate | **QBER ≈ 0%** |
| Intercept-resend eavesdropping error rate | **QBER ≈ 25%** (20–28% at small n; 25.6% at n=2000) |

**Interpretation.** On a noiseless channel Alice and Bob's sifted bits agree, so the error rate stays at zero. When Eve measures each qubit in transit she must guess the basis, guessing wrong half the time, and each wrong guess has a 50% chance of flipping the outcome, injecting errors into ~25% of the sifted bits. The platform's aim is to teach this security principle by demonstrating the measurable increase in QBER, produced by Qiskit circuit execution. 

---

## 2. Technical dependencies

Dependencies are kept intentionally minimal — the POC depends on Qiskit and nothing else beyond the Python standard library.

**Runtime**
- **Python ≥ 3.10** — minimum Python version needed to run the POC- required for Qiskit 2.5.2
- The modules `random` and `argparse` imported in the POC are part of the Python standard library and do not need to be separately installed. 

**Direct third-party dependencies** (pinned in `requirements.txt`, see 'setup & run' section of 'README.md' for installation)
- `qiskit==2.5.2` — circuit construction and the quantum framework.
- `qiskit-aer==0.17.2` — the local simulator that executes the circuits.

**Transitive dependencies** (installed automatically by pip, listed for completeness): numpy, scipy, rustworkx, dill, stevedore, typing-extensions (via qiskit); psutil, python-dateutil (via qiskit-aer). The team does not manage these directly.

**Platform / hardware**
- Pure simulation — **no quantum hardware and no IBM Quantum account required** (consistent with BR-04).
    - Qiskit Aer (`AerSimulator()`) is used in the POC, runs on your local machine for free without the need for internet, or setting up an IBM account. 
    - This eliminates the need for account setup, queue waits and hardware noise involved in using a real QPU. 
- No GPU required.
- Verified on Linux x86-64 and on Apple Silicon (arm64) macOS; Qiskit ships native arm64 wheels.

**Install**

## MacOS setup

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```
## Windows setup

​```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
​```

**Implication for Sprint 2.** Wherever the quantum code runs after integration, that environment must provide **Python ≥ 3.10**. This is the concrete version to check against the hosting decision flagged in `TECHNICAL-ARCHITECTURE.md`.

---

## 3. Limitations and assumptions

The POC is a teaching demonstration, and is not a production QKD system. Each item below has been simplified so that so no one mistakes the POC for more than it is, and so Sprint 2 can decide which (if any) to address.

### Modelling simplifications

- **No channel noise.** The simulator is ideal, so a clean channel gives exactly 0% QBER. Real quantum channels are noisy and show a non-zero baseline even without an eavesdropper, which is why real BB84 accepts a key only below a security threshold (commonly cited around 11%). The POC never exercises that threshold — it treats "any error" as "Eve". *Sprint 2 decision: keep it simple for clarity, or add an optional noise control to teach the threshold idea.*

- **One attack is enough to teach the security principle.** Eve uses intercept-resend, the simplest attack. The ~25% figure is specific to it and a different attack would produce a different error output; general attacks considered in formal security proofs are out of scope. The POC assumes that only demonstrating the simplest attack is enough to serve the platform's purpose, this can be a reasonable assumption for a beginner teaching tool. 

- **No post-processing.** Real BB84 finishes with error correction (reconciliation) and privacy amplification to produce a secret key. The POC stops after QBER estimation, so its "final key" is simply the leftover sifted bits — which is not a cryptographically secure key. This keeps the demonstration legible and must not be presented as a secure key.

- **QBER estimated by sacrificing ~half the sifted bits.** A real implementation samples a small random subset. The POC's larger sample is a demonstration convenience.

### Protocol assumptions

- **Authenticated classical channel assumed.** BB84's security relies on the public discussion (basis comparison) being authenticated — Eve may listen but not tamper since bases are shared publicly and bit values are not. The POC compares bases directly and does not model/simulate the classical channel (Alice and Bob's conversation). Eve is assumed to be unable to tamper but is able to listen to the public conversation between Bob and Alice. Modelling classical channel communication may not be necessary for the platform to serve its purpose. 

- **Standard prepare-and-measure BB84.** BB84 uses single qubits, two bases, and does not use entanglement. (this is not a limitation) — noted only to be explicit that it is not an entanglement-based variant of QKD

### Implementation assumptions

- **Non-cryptographic randomness.** Bits and bases come from Python's `random`, which is seedable for reproducible runs. Adequate for a demo; a real system would use a cryptographic or quantum RNG.
- **One circuit per qubit.** Chosen for clarity. Runs comfortably to a few thousand qubits; not optimised beyond that. Batching into fewer circuits is a straightforward later optimisation (relates to NFR-02).

### Scope assumption

- **Standalone by design.** The POC has no server, database, frontend, or web integration, and is not imported by the product. 

---

## 4. Traceability

| Checklist item | Where addressed |
|---|---|
| BB84 POC executes successfully | §1 (verified re-run) |
| Core key-exchange flow demonstrated | §1; `bb84_poc.py`, `SAMPLE-OUTPUT.txt` |
| Results documented | §1 |
| Technical dependencies documented | §2 |
| Limitations/assumptions documented | §3 |
| POC ready to guide Sprint 2 implementation | `SPRINT2-HANDOVER.md` |
