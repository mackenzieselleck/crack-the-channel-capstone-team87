"""Pydantic request/response models for the Qiskit BB84 service.

The request is a small, validated set of parameters per TECHNICAL-ARCHITECTURE.md
section 5 and SPRINT2-HANDOVER.md section 3: the service must never execute learner or
AI-supplied code, only turn validated parameters into circuits itself.
"""

from typing import List, Optional

from pydantic import BaseModel, Field


class BB84Request(BaseModel):
    num_qubits: int = Field(200, ge=2, le=5000, description="Number of qubits to exchange")
    eavesdrop: bool = Field(False, description="Simulate an intercept-resend eavesdropper")
    seed: Optional[int] = Field(None, description="RNG seed for a reproducible run")
    block_size: int = Field(4, ge=1, le=64, description="Error-correction block size")
    security_parameter: int = Field(
        32, ge=0, le=256, description="Extra bits shaved off during privacy amplification"
    )
    trace_limit: int = Field(
        50, ge=0, le=500, description="Max number of per-qubit trace rows to return"
    )


class TraceRow(BaseModel):
    alice_bit: int
    alice_basis: str
    eve_basis: Optional[str] = None
    bob_basis: str
    bob_result: int
    kept: bool


class ErrorCorrectionResult(BaseModel):
    block_size: int
    leaked_bits: int
    corrected_errors: int
    residual_mismatches: int


class PrivacyAmplificationResult(BaseModel):
    input_length: int
    output_length: int
    compression_ratio: float


class BB84Response(BaseModel):
    num_qubits: int
    eavesdrop: bool
    sifted_key_length: int
    qber: float
    sample_size: int
    errors: int
    eavesdropping_detected: bool
    final_key_preview: str
    trace: List[TraceRow]

    error_correction: ErrorCorrectionResult
    privacy_amplification: PrivacyAmplificationResult
    secure_key_preview: str
    secure_key_length: int