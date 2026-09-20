"""
FastAPI wrapper around the BB84 POC's core logic, per
TECHNICAL-ARCHITECTURE.md ("Target architecture" / "Migration path: POC ->
service"). Stateless: no auth, no persistence, no user data - it only turns
validated parameters into a BB84 run and returns the result as JSON.

Run locally:
    uvicorn app.main:app --reload --port 8000

The Next.js backend (my-app/app/api/simulator/route.ts) calls
POST /bb84/run on this service.
"""

import random

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .bb84 import BASIS_SYMBOL, run_bb84
from .postprocessing import (
    bits_to_hex_preview,
    cascade_reconcile,
    privacy_amplification,
)
from .schemas import (
    BB84Request,
    BB84Response,
    ErrorCorrectionResult,
    PrivacyAmplificationResult,
    TraceRow,
)

# QBER above this is treated as eavesdropping detected, matching the
# widely-cited ~11% BB84 security threshold (see TECHNICAL-NOTES.md section 3).
QBER_DETECTION_THRESHOLD = 0.11

app = FastAPI(title="Crack the Channel - Qiskit BB84 service")

# The service is internal-only (reached solely by the web backend per the
# architecture doc), but CORS is left open here since it may be called
# directly during local development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/bb84/run", response_model=BB84Response)
def run(request: BB84Request) -> BB84Response:
    rng = random.Random(request.seed) if request.seed is not None else random.Random()
    run_result = run_bb84(request.num_qubits, request.eavesdrop, rng)

    corrected_bob, leaked_bits, corrected_errors = cascade_reconcile(
        run_result["alice_remaining"],
        run_result["bob_remaining"],
        block_size=request.block_size,
    )
    residual_mismatches = sum(
        1
        for a, b in zip(run_result["alice_remaining"], corrected_bob)
        if a != b
    )

    secure_key, output_length = privacy_amplification(
        corrected_bob,
        run_result["qber"],
        leaked_bits,
        security_parameter=request.security_parameter,
    )

    input_length = len(corrected_bob)
    compression_ratio = (output_length / input_length) if input_length else 0.0

    trace = [
        TraceRow(
            alice_bit=run_result["alice_bits"][i],
            alice_basis=BASIS_SYMBOL[run_result["alice_bases"][i]],
            eve_basis=(
                BASIS_SYMBOL[run_result["eve_bases"][i]] if request.eavesdrop else None
            ),
            bob_basis=BASIS_SYMBOL[run_result["bob_bases"][i]],
            bob_result=run_result["bob_results"][i],
            kept=i in set(run_result["sifted_idx"]),
        )
        for i in range(min(request.trace_limit, request.num_qubits))
    ]

    return BB84Response(
        num_qubits=run_result["n"],
        eavesdrop=run_result["eavesdrop"],
        sifted_key_length=len(run_result["sifted_idx"]),
        qber=run_result["qber"],
        sample_size=run_result["sample_size"],
        errors=run_result["errors"],
        eavesdropping_detected=run_result["qber"] > QBER_DETECTION_THRESHOLD,
        final_key_preview=bits_to_hex_preview(run_result["alice_remaining"]),
        trace=trace,
        error_correction=ErrorCorrectionResult(
            block_size=request.block_size,
            leaked_bits=leaked_bits,
            corrected_errors=corrected_errors,
            residual_mismatches=residual_mismatches,
        ),
        privacy_amplification=PrivacyAmplificationResult(
            input_length=input_length,
            output_length=output_length,
            compression_ratio=compression_ratio,
        ),
        secure_key_preview=bits_to_hex_preview(secure_key),
        secure_key_length=output_length,
    )