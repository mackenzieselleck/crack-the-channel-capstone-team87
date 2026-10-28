"""Daily QA gaps: actual Qiskit grading, exact maths and malformed gate inputs.

This reproduces a two-qubit identity fixture, not the unrecorded historical
challenge instance from the manual report. No HTTP service or LLM is mocked
inside these grader checks.
"""
import json
import re
from pathlib import Path

import pytest
from qiskit.quantum_info import Operator

from app.challenges import REGISTRY
from app.challenges.gate_simplification import build


def test_every_category_scheduled_by_next_has_a_real_python_generator():
    # Cross-service contract: inspect the actual consumer's static export,
    # rather than letting parametrisation silently skip a missing generator.
    server = Path(__file__).resolve().parents[3] / "my-app/lib/supabase/server.ts"
    declaration = re.search(r"export const PYTHON_TYPES = \[(.*?)\] as const", server.read_text(encoding="utf-8"), re.S)
    assert declaration is not None, "Could not locate the scheduler category declaration"
    scheduled = re.findall(r"['\"]([a-z_]+)['\"]", declaration.group(1))
    assert scheduled
    assert set(scheduled) <= set(REGISTRY), f"Scheduled categories without generators: {set(scheduled) - set(REGISTRY)}"


def two_gate_answer():
    return {"circuit": ["h 0", "h 1", "cx 0 1", "h 0", "h 1", "x 1"],
            "reference": ["cx 1 0", "x 1"], "optimal_count": 2, "num_qubits": 2}


def test_accepts_the_two_gate_cnot_then_x_solution():
    answer = two_gate_answer()
    assert Operator(build(answer["reference"], 2)).equiv(Operator(build(answer["circuit"], 2)))
    assert REGISTRY["gate_simplification"].grade(answer, {"circuit": ["cx 1 0", "x 1"]}).correct


def test_rejects_an_equivalent_six_gate_circuit_as_not_minimal():
    answer = two_gate_answer()
    result = REGISTRY["gate_simplification"].grade(answer, {"circuit": answer["circuit"]})
    assert not result.correct
    assert result.mistake_tag == "not_simplest"


def test_empty_circuit_is_accepted_when_the_original_is_identity():
    answer = {"circuit": ["h 0", "h 0"], "reference": [], "optimal_count": 0, "num_qubits": 1}
    assert REGISTRY["gate_simplification"].grade(answer, {"circuit": []}).correct


def test_non_equivalent_circuit_does_not_pass():
    result = REGISTRY["gate_simplification"].grade(two_gate_answer(), {"circuit": []})
    assert not result.correct and result.mistake_tag == "not_equivalent"


@pytest.mark.parametrize("token", ["", "   ", "exec 0", "cx 0 0", "h -1", "h 2", "cx 0", "h 0 1"])
def test_invalid_tokens_return_a_grade_instead_of_crashing(token):
    result = REGISTRY["gate_simplification"].grade(two_gate_answer(), {"circuit": [token]})
    assert not result.correct and result.mistake_tag == "invalid_circuit"


@pytest.mark.parametrize("expression", ["1/sqrt(3)", "sqrt(3)/3", "sqrt(1/3)"])
def test_accepts_equivalent_exact_normalisation_expressions(expression):
    result = REGISTRY["normalisation"].grade({"N": "sqrt(3)/3", "wrong": {}}, {"text": expression})
    assert result.correct


@pytest.mark.parametrize("name", sorted(REGISTRY))
@pytest.mark.parametrize("difficulty", [1, 2, 3])
def test_each_category_and_tier_accepts_a_json_roundtrip_of_its_solution(name, difficulty):
    category = REGISTRY[name]
    challenge = category.generate(87, difficulty)
    stored = json.loads(json.dumps(challenge.to_dict()))
    assert category.grade(stored["answer"], category.solution_submission(stored["answer"])).correct
