"""
BB84 key exchange core logic imported from docs/sprint-1/bb84-poc/bb84_poc.py (build_qubit_circuit, transmit,
run_bb84). Everything here is called from the FastAPI endpoint instead. Measurement randomness is seeded now rather than 
just classical bit/basis choices so a seed produces a fully reproducible run. 
"""

import random

from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

SIM = AerSimulator()

# Basis encoding used throughout:
#   0 = rectilinear basis  (Z-basis: states |0>, |1>)
#   1 = diagonal basis     (X-basis: states |+>, |->)
RECTILINEAR, DIAGONAL = 0, 1
BASIS_SYMBOL = {RECTILINEAR: "+", DIAGONAL: "x"}


def build_qubit_circuit(bit: int, prep_basis: int, meas_basis: int) -> QuantumCircuit:
    """Returns a Qiskit circuit that prepares one qubit in `prep_basis` encoding
    `bit`, then measures it in `meas_basis`."""
    qc = QuantumCircuit(1, 1)

    if bit == 1:
        qc.x(0)
    if prep_basis == DIAGONAL:
        qc.h(0)

    qc.barrier(label="send")

    if meas_basis == DIAGONAL:
        qc.h(0)
    qc.measure(0, 0)
    return qc


def transmit(bit: int, prep_basis: int, meas_basis: int, seed: int | None = None) -> int: #seed number is optional, defaults to 'None' if not given
    """Run one qubit's circuit on the simulator and return the measured bit.
    """
    result = SIM.run(
        build_qubit_circuit(bit, prep_basis, meas_basis),   #build a circuit so simulator can run
        shots=1,      #run simulation once and give one result instead of repeated tries 
        memory=True,  #remember result of a particular run
        seed_simulator=seed,   #seed input used to determine outcome of measurement when bases don't match
                               #if seed is none, generates random outcome on its own 
                               
    ).result()
    return int(result.get_memory()[0])


def run_bb84(n: int, eavesdrop: bool, rng: random.Random) -> dict:
    """
    Execute a full BB84 exchange over n qubits and return every stage's data.

    Flow: preparation -> (optional Eve) -> measurement -> basis reconciliation
          (sifting) -> error estimation (QBER) -> sifted key.

    Unlike the POC, this returns both Alice's and Bob's bits for the
    portion of the sifted key, since key post-processing 
    (error correction / privacy amplification) needs both
    sides to reconcile a shared secret key.
    """
    alice_bits = [rng.randint(0, 1) for _ in range(n)] 
    alice_bases = [rng.randint(0, 1) for _ in range(n)]
    bob_bases = [rng.randint(0, 1) for _ in range(n)]
    eve_bases = [rng.randint(0, 1) for _ in range(n)] if eavesdrop else None

    # seed needed for each measurement
    # Every time the quantum simulator measures a qubit in the wrong basis (mismatch), outcome is either 0 or 1.
    # To make this repeatable, assign seed for a particular mismatched measurement.

    # for each of Alice's n qubits there are up to 2 measurements that might happen- 
    # Bob's + Eve's (if listening), so at most we need 2 seeds
    sim_seeds = [rng.randint(0, 2**31 - 1) for _ in range(2 * n)]  # e.g. n = 3 qubits sent, 2 * 3 = 6 seeds needed total

    bob_results = []
    for i in range(n):
        bit, basis = alice_bits[i], alice_bases[i]
        if eavesdrop:
            eve_bit = transmit(bit, basis, eve_bases[i], seed=sim_seeds[2 * i])
            bit, basis = eve_bit, eve_bases[i]
        bob_results.append(transmit(bit, basis, bob_bases[i], seed=sim_seeds[2 * i + 1]))

    sifted_idx = [i for i in range(n) if alice_bases[i] == bob_bases[i]]
    alice_key = [alice_bits[i] for i in sifted_idx]
    bob_key = [bob_results[i] for i in sifted_idx]

    sample_size = len(sifted_idx) // 2  #half the bits in the sifted key will be publicly compared 
    errors = sum(1 for j in range(sample_size) if alice_key[j] != bob_key[j]) #within sample size, count how many positions disagree between Alice and Bob
    qber = (errors / sample_size) if sample_size else 0.0   #turn error count into % (if sample size = 0, return 0 instead of dividing by 0)

    # Bits not sacrificed for QBER estimation used in key post-processing as these are still secret at this point
    alice_remaining = alice_key[sample_size:]
    bob_remaining = bob_key[sample_size:]

    return {
        "n": n,
        "eavesdrop": eavesdrop,
        "alice_bits": alice_bits,
        "alice_bases": alice_bases,
        "bob_bases": bob_bases,
        "eve_bases": eve_bases,
        "bob_results": bob_results,
        "sifted_idx": sifted_idx,
        "alice_key": alice_key,
        "bob_key": bob_key,
        "sample_size": sample_size,
        "errors": errors,
        "qber": qber,
        "alice_remaining": alice_remaining,
        "bob_remaining": bob_remaining,
    }
