"""
BB84 Quantum Key Distribution - Standalone Proof of Concept
===========================================================
Crack the Channel | Team 87 - IBM Cyber Security: Quantum Risks

WHAT THIS IS
    A self-contained demonstration of the BB84 protocol built on executable
    Qiskit circuits 

    This POC is deliberately standalone. It has no web server, no database,
    no frontend, and is not imported by the web product. Its purpose is to
    prove the quantum key-exchange works and to show the shape of the data a
    future backend would expose. Integration is documented separately in
    TECHNICAL-ARCHITECTURE.md and is not performed here.

SETUP
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    python bb84_poc.py                # default demo (Eve on and off)
    python bb84_poc.py --qubits 500   # larger exchange
    python bb84_poc.py --seed 7       # reproducible run

BB84 BRIEF EXPLANATION
    Alice sends single qubits, each encoding a random bit in a randomly chosen
    basis (rectilinear + or diagonal x). Bob measures each in his own randomly
    chosen basis. Afterwards they publicly compare which basis they used for
    each qubit (not the bit values) and keep only the positions where the
    bases matched - the "sifted key". On a clean channel those bits agree. An
    eavesdropper (Eve) who measures in transit is forced to guess the basis,
    disturbs the qubits she guesses wrong, and injects ~25% errors into the
    sifted key. Measuring that error rate (QBER) is how BB84 detects her.
"""

import argparse
import random

from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# One simulator instance reused for every circuit.
SIM = AerSimulator()

# Basis encoding used throughout:
#   0 = rectilinear basis  (Z-basis: states |0>, |1>)
#   1 = diagonal basis     (X-basis: states |+>, |->)
RECTILINEAR, DIAGONAL = 0, 1
BASIS_SYMBOL = {RECTILINEAR: "+", DIAGONAL: "x"}


def build_qubit_circuit(bit: int, prep_basis: int, meas_basis: int) -> QuantumCircuit: #takes parameters: bit (that Alice wants to send), 
                                                                                       #prep_basis (that Alice encodes the bit in), meas_basis (that Bob reads the bit in)
    """
    Returns a real Qiskit circuit for a single BB84 qubit.
    Prepares a single qubit with a bit value in some basis then measured in another (possibly same) basis 

    Preparation (Alice):
        - X gate flips |0> -> |1> to encode a bit value of 1.
        - H gate rotates into the diagonal basis if that basis was chosen.
    Measurement (Bob, or Eve):
        - H before measuring rotates the diagonal basis back so a standard
          Z-measurement reads the correct value.
    """
    qc = QuantumCircuit(1, 1) # makes a circuit with 1 qubit and 1 classical bit to store measurement result (a qubit always starts in state 0>)

    # --- Alice prepares the qubit ---
    if bit == 1:
        qc.x(0) #the X gate that handles the bit value 
                #the X gate changes the 0> state to 1>, so if Alice wants to send a 1 it flips the 0> to a 1>, if she wants to send a 0 it stays 0>

    if prep_basis == DIAGONAL:
        qc.h(0) #Hadamard gate that handles the basis 
                #if the chosen basis is diagonal it rotates the qubit off the straight 0> / 1> axis onto the diagonal one, i.e. 0> becomes + and 1> becomes -
                #if the chosen basis is rectilinear, this won't apply and the qubit stays as 0> or 1> 

    qc.barrier(label="send")  # visual separator between prep and measure (this is nothing, just used for diagram in sample output)

    # --- Measurement in the chosen basis ---
    if meas_basis == DIAGONAL:
        qc.h(0)     #H rotates the diagonal axis back to straight so a standard measurement now reads the diagonal value correctly 
    qc.measure(0, 0)
    return qc
#in Qiskit and real hardware you can only measure in rectilinear basis 
#for Bob to read in the diagonal axis, he applies H first then does a normal measurement 


def transmit(bit: int, prep_basis: int, meas_basis: int) -> int:
    """Run one qubit's circuit on the simulator and return the measured bit."""
    result = SIM.run(build_qubit_circuit(bit, prep_basis, meas_basis),
                     shots=1, memory=True).result()
    return int(result.get_memory()[0])


def run_bb84(n: int, eavesdrop: bool, rng: random.Random) -> dict:
    """
    Execute a full BB84 exchange over n qubits and return every stage's data.

    Flow: preparation -> (optional Eve) -> measurement -> basis reconciliation
          (sifting) -> error estimation (QBER) -> final key.
    """
    alice_bits  = [rng.randint(0, 1) for _ in range(n)]
    alice_bases = [rng.randint(0, 1) for _ in range(n)]
    bob_bases   = [rng.randint(0, 1) for _ in range(n)]
    eve_bases   = [rng.randint(0, 1) for _ in range(n)] if eavesdrop else None

    bob_results = []
    for i in range(n):
        bit, basis = alice_bits[i], alice_bases[i]
        if eavesdrop:
            # Intercept-resend: Eve measures in a guessed basis, then re-sends
            # what she saw. When she guesses wrong she corrupts the qubit.
            eve_bit = transmit(bit, basis, eve_bases[i])
            bit, basis = eve_bit, eve_bases[i]
        bob_results.append(transmit(bit, basis, bob_bases[i]))

    # Basis reconciliation (sifting): keep positions where bases matched.
    sifted_idx = [i for i in range(n) if alice_bases[i] == bob_bases[i]]
    alice_key  = [alice_bits[i] for i in sifted_idx]
    bob_key    = [bob_results[i] for i in sifted_idx]

    # Error estimation: publicly compare a sample of the sifted bits to
    # estimate QBER. Sacrifice ~half; the rest becomes the final key.
    sample_size = len(sifted_idx) // 2
    errors = sum(1 for j in range(sample_size) if alice_key[j] != bob_key[j])
    qber = (errors / sample_size) if sample_size else 0.0
    final_key = alice_key[sample_size:]

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
        "final_key": final_key,
    }


# --------------------------------------------------------------------------
# Presentation helpers (console output only - documents the flow & results)
# --------------------------------------------------------------------------

def show_example_circuits() -> None:
    """Print two example circuits so the Qiskit output is documented."""
    print("1 - BB84 circuit execution")
    print("-" * 64)
    print("Example: Alice encodes bit=1 in the diagonal (x) basis,")
    print("Bob measures in the diagonal (x) basis (bases match).\n")
    print(build_qubit_circuit(bit=1, prep_basis=DIAGONAL, meas_basis=DIAGONAL).draw(output="text"))
    print("\nExample: same qubit, Bob measures in the rectilinear (+) basis")
    print("(bases mismatch - Bob's result is random).\n")
    print(build_qubit_circuit(bit=1, prep_basis=DIAGONAL, meas_basis=RECTILINEAR).draw(output="text"))
    print()


def show_flow_table(run: dict, rows: int = 16) -> None:
    """Print the first `rows` qubits of the exchange as a readable table."""
    print("2 - Core key-exchange flow demonstration")
    print("-" * 64)
    print(f"Showing first {rows} of {run['n']} qubits "
          f"({'Eve present' if run['eavesdrop'] else 'no eavesdropper'}):\n")
    header = "  i | A-bit A-base | Eve | B-base B-res | kept? match?"
    print(header)
    print("  " + "-" * (len(header) - 2))
    sifted = set(run["sifted_idx"])
    for i in range(min(rows, run["n"])):
        eve = BASIS_SYMBOL[run["eve_bases"][i]] if run["eavesdrop"] else "-"
        kept = "yes" if i in sifted else " . "
        match = ""
        if i in sifted:
            match = "OK" if run["alice_bits"][i] == run["bob_results"][i] else "ERR"
        print(f"  {i:2d} |   {run['alice_bits'][i]}     {BASIS_SYMBOL[run['alice_bases'][i]]}   "
              f"|  {eve}  |   {BASIS_SYMBOL[run['bob_bases'][i]]}     {run['bob_results'][i]}   "
              f"|  {kept}   {match}")
    print()


def show_results(run: dict) -> None:
    """Print the summary statistics and sample key."""
    label = "Eve intercepting" if run["eavesdrop"] else "No eavesdropper"
    print(f"  [{label}]")
    print(f"    qubits sent .............. {run['n']}")
    print(f"    sifted key length ........ {len(run['sifted_idx'])} "
          f"(~{100*len(run['sifted_idx'])//run['n']}% of qubits, bases matched)")
    print(f"    bits sampled for QBER .... {run['sample_size']}")
    print(f"    errors in sample ......... {run['errors']}")
    print(f"    QBER ..................... {run['qber']:.1%}")
    verdict = ("HIGH error rate -> eavesdropping detected, key discarded"
               if run["qber"] > 0.11 else
               "low error rate -> channel trusted, key accepted")
    print(f"    verdict .................. {verdict}")
    key_preview = "".join(map(str, run["final_key"][:24]))
    print(f"    final key (first 24 bits)  {key_preview}{'...' if len(run['final_key']) > 24 else ''}")
    print()


def main() -> None:
    parser = argparse.ArgumentParser(description="Standalone BB84 Qiskit POC")
    parser.add_argument("--qubits", type=int, default=200, help="number of qubits to send")
    parser.add_argument("--seed", type=int, default=42, help="RNG seed for reproducibility")
    args = parser.parse_args()

    print("=" * 64)
    print("  BB84 QKD - Standalone Qiskit Proof of Concept")
    print("  Crack the Channel | Team 87")
    print("=" * 64 + "\n")

    show_example_circuits()

    rng = random.Random(args.seed)
    clean = run_bb84(args.qubits, eavesdrop=False, rng=rng)
    eve   = run_bb84(args.qubits, eavesdrop=True, rng=rng)

    show_flow_table(clean)

    print("3 - Qiskit outputs / results documented")
    print("-" * 64)
    show_results(clean)
    show_results(eve)

    print("KEY OBSERVATION")
    print("-" * 64)
    print("  A clean channel yields ~0% QBER; intercept-resend eavesdropping")
    print("  drives QBER to ~25%. That increase reflects the security principle")
    print("  being taught by the platform")
    print("=" * 64)


if __name__ == "__main__":
    main()
