"""Pydantic request/response models for the Qiskit BB84 service.

The request is a small, validated set of parameters per TECHNICAL-ARCHITECTURE.md
section 5 and SPRINT2-HANDOVER.md section 3: the service must never execute learner or
AI-supplied code, only turn validated parameters into circuits itself.
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field, model_validator


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

    # NPC handling: at most one role is played by the user
    #every other role generated as an NPC using the existing random logic in run_bb84()

    user_role: Optional[Literal["alice", "bob", "eve"]] = Field(
        None, description="Which role the learner is playing. Omit to run all roles as NPCs."
    )
    user_bases: Optional[List[int]] = Field(
        None,
        description="Learner's basis per qubit (0=rectilinear, 1=diagonal). "
                    "Required, length num_qubits, when user_role is set.",
    )
    user_bits: Optional[List[int]] = Field(
        None,
        description="Learner's bit per qubit. Only used when user_role='alice' "
                    "(Bob/Eve measure rather than choose a bit).",
    )

    @model_validator(mode="after")
    def _validate_user_role(self) -> "BB84Request":
        if self.user_role is None:
            return self
        if self.user_role == "eve" and not self.eavesdrop:
            raise ValueError("user_role='eve' requires eavesdrop=true")
        if self.user_bases is None or len(self.user_bases) != self.num_qubits:
            raise ValueError("user_bases is required and must have length num_qubits when user_role is set")
        if any(b not in (0, 1) for b in self.user_bases):
            raise ValueError("user_bases values must be 0 or 1")
        if self.user_role == "alice":
            if self.user_bits is None or len(self.user_bits) != self.num_qubits:
                raise ValueError("user_bits is required and must have length num_qubits when user_role='alice'")
            if any(b not in (0, 1) for b in self.user_bits):
                raise ValueError("user_bits values must be 0 or 1")
        return self


class TraceRow(BaseModel):
    alice_bit: int
    alice_basis: str
    eve_basis: Optional[str] = None
    eve_bit: Optional[int] = None
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