import random

from app.bb84 import DIAGONAL, RECTILINEAR, build_qubit_circuit, run_bb84, transmit


def test_build_qubit_circuit_creates_a_measured_single_qubit_circuit():
    circuit = build_qubit_circuit(1, DIAGONAL, RECTILINEAR)

    assert circuit.num_qubits == 1
    assert circuit.num_clbits == 1
    assert circuit.count_ops()["measure"] == 1


def test_transmit_returns_a_bit_when_bases_match():
    assert transmit(0, RECTILINEAR, RECTILINEAR, seed=1) == 0
    assert transmit(1, RECTILINEAR, RECTILINEAR, seed=1) == 1
    assert transmit(0, DIAGONAL, DIAGONAL, seed=1) == 0
    assert transmit(1, DIAGONAL, DIAGONAL, seed=1) == 1


def test_run_bb84_is_reproducible_for_the_same_random_generator_state():
    first = run_bb84(20, False, random.Random(42))
    second = run_bb84(20, False, random.Random(42))

    assert first == second


def test_run_bb84_without_eavesdropping_has_no_errors():
    result = run_bb84(40, False, random.Random(42))

    assert result["n"] == 40
    assert result["eavesdrop"] is False
    assert result["qber"] == 0.0
    assert result["errors"] == 0
    assert result["alice_key"] == result["bob_key"]


def test_run_bb84_eavesdropping_populates_eve_data():
    result = run_bb84(20, True, random.Random(42))

    assert result["eavesdrop"] is True
    assert result["eve_bases"] is not None
    assert result["eve_bits"] is not None
    assert len(result["eve_bases"]) == 20
    assert len(result["eve_bits"]) == 20
