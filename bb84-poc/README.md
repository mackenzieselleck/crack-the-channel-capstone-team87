# BB84 Standalone POC — Crack the Channel (Team 87)

A self-contained Qiskit proof-of-concept for the BB84 quantum key distribution
protocol. Proves the quantum key-exchange works and shows the QBER jump caused
by an eavesdropper using Qiskit circuits

This POC is not integrated into the web product, how it will later connect is documented in `TECHNICAL-ARCHITECTURE.md`.

## Setup & run
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python bb84_poc.py                 # default demo (Eve off, then on)
python bb84_poc.py --qubits 2000   # QBER converges to ~25% with Eve
python bb84_poc.py --seed 7        # reproducible run
```

## Files
- `bb84_poc.py` — the proof-of-concept
- `SAMPLE-OUTPUT.txt` — captured output of a default run
- `TECHNICAL-ARCHITECTURE.md` — how the POC will connect to the web app later
- `requirements.txt` — pinned Qiskit + Aer versions
