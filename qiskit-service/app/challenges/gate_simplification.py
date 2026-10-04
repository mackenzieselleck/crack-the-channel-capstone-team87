"""Gate simplification, built BACKWARDS from known identities.

The reference answer is known by construction, then shortened further by a
small brute-force search so 'optimal' is accurate. Any equivalent circuit the
user builds is accepted via Operator.equiv (which ignores global phase).
User circuits need to arrive as whitelisted tokens from a drag and drop builder,
never as raw circuit code.
"""
from __future__ import annotations

import itertools

from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

from .base import (MAX_REGEN, Challenge, ChallengeType, grade_mc, make_options,
                   register, rng_for)

#single qubit identities. Problems use long form
#short form is simplified answer. XZX = -Z, which equals Z up to global phase
ONE_Q = [
    (["h", "h"], []), (["x", "x"], []), (["z", "z"], []),
    (["h", "x", "h"], ["z"]), (["h", "z", "h"], ["x"]),
    (["s", "s"], ["z"]), (["x", "z", "x"], ["z"]),
]
#2 qubit identities, written as tokens
TWO_Q = [
    (["cx 0 1", "cx 0 1"], []),
    (["h 0", "h 1", "cx 0 1", "h 0", "h 1"], ["cx 1 0"]),
]
#single qubit gates available in circuit builder
PALETTE_1Q = ["h", "x", "z", "s"]
#longest circuit user can submit
MAX_TOKENS = 20


def build(tokens: list[str], n: int) -> QuantumCircuit:
    """Build a circuit from tokens like ["h 0", "cx 0 1"], rejecting anything not whitelisted."""
    qc = QuantumCircuit(n)
    for t in tokens[:MAX_TOKENS]:
        parts = str(t).split()
        g, qs = parts[0].lower(), parts[1:]               #gate name, then qubit numbers
        #every qubit must be a whole number that exists in this circuit
        if not all(q.isdigit() and int(q) < n for q in qs):
            raise ValueError("bad qubit")
        qs = [int(q) for q in qs]
        if g in PALETTE_1Q and len(qs) == 1:
            getattr(qc, g)(qs[0])                         
        elif g == "cx" and len(qs) == 2 and qs[0] != qs[1]:
            qc.cx(*qs)                                    
        else:
            raise ValueError("bad gate")
    return qc


def palette(n: int) -> list[str]:
    """Every gate token the builder offers for an n-qubit circuit."""
    toks = [f"{g} {q}" for q in range(n) for g in PALETTE_1Q]
    if n == 2:
        toks += ["cx 0 1", "cx 1 0"]
    return toks


def shortest_equivalent(tokens: list[str], n: int, max_len: int = 2) -> list[str]:
    """Try every circuit of up to max_len gates (shortest first) and return the first one
    equivalent to `tokens`. Chained identities can sometimes simplify further (e.g. Z then Z
    cancels), so this makes the reference answer genuinely short. Returns `tokens` if nothing
    shorter is found."""
    target = Operator(build(tokens, n))
    for length in range(0, min(len(tokens), max_len + 1)):
        for combo in itertools.product(palette(n), repeat=length):
            if Operator(build(list(combo), n)).equiv(target):
                return list(combo)
    return tokens


def pretty(tokens: list[str]) -> str:
    """Readable circuit text, e.g. ["h 0", "cx 0 1"] -> "H(q0) · CNOT(0→1)"."""
    out = []
    for t in tokens:
        p = t.split()
        out.append(f"CNOT({p[1]}→{p[2]})" if p[0] == "cx" else f"{p[0].upper()}(q{p[1]})")
    return " · ".join(out) or "(no gates — identity)"


@register
class GateSimplificationChallenge(ChallengeType):
    name = "gate_simplification"

    mistakes = {
        "correct": "Correct: your circuit does exactly the same thing with fewer gates.",
        "wrong_gate": "Not that one. Try multiplying the matrices, or look for a known identity "
                      "like HXH = Z.",
        "not_equivalent": "Your circuit behaves differently from the original. Look for pairs "
                          "that cancel (HH = I) and sandwiches like HXH = Z.",
        "not_simplest": "Your circuit is equivalent, but it can be made even shorter.",
        "invalid_circuit": "That circuit uses a gate or qubit that isn't available.",
        "other": "Not quite. Look for gates that cancel or combine.",
    }

    def generate(self, seed: int, difficulty: int) -> Challenge:
        for attempt in range(MAX_REGEN):
            rng = rng_for(seed, difficulty, attempt)

            #Tier 1: "which single gate equals HXH?" (multiple choice)
            if difficulty == 1:
                #only identities that simplify to a single gate
                long, short = rng.choice([i for i in ONE_Q if i[1]])
                correct = short[0].upper()
                #3 wrong gates chosen from remaining options
                others = [g for g in ["X", "Z", "H", "S", "I (no gate)"] if g != correct]
                ds = rng.sample(others, 3)
                options, mc = make_options(rng, correct, [(d, "wrong_gate") for d in ds])
                expr = "".join(g.upper() for g in long)          
                return Challenge(
                    self.name, 1, seed, "multiple_choice",
                    prompt_data={"task": "which_single_gate", "expression": expr},
                    answer=mc, options=options,
                    worked_solution=f"{expr} = {correct} (a standard gate identity; check by "
                                    f"multiplying the matrices).",
                    leak_terms=[f"= {correct}"],
                )

            #Tiers 2–3: chain identities into a longer circuit for user simplification
            n = 1 if difficulty == 2 else 2           #tier 2: 1 qubit. Tier 3: 2 qubits
            problem, ref = [], []                     #long circuit, and its known short form
            picks = 3 if difficulty == 2 else 2       #how many identities to chain
            for k in range(picks):
                #Tier 3 always includes at least one two qubit identity and each later pick has a 50% chance of being two qubit
                if n == 2 and (k == 0 or rng.random() < 0.5):
                    long, short = rng.choice(TWO_Q)
                    problem += long
                    ref += short
                else:
                    #single qubit identity on a random qubit
                    long, short = rng.choice(ONE_Q)
                    q = rng.randint(0, n - 1)
                    problem += [f"{g} {q}" for g in long]
                    ref += [f"{g} {q}" for g in short]
            #shorten the reference further if chained short forms combine
            ref = shortest_equivalent(ref, n) if len(ref) > 0 else ref
            #require at least 3 gates of saving, so the problem is worth simplifying
            if len(problem) - len(ref) < 3:
                continue
            return Challenge(
                self.name, difficulty, seed, "circuit",
                prompt_data={"task": "simplify_circuit", "num_qubits": n,
                             "circuit": problem, "circuit_pretty": pretty(problem),
                             "palette": palette(n), "original_gate_count": len(problem)},
                answer={"circuit": problem, "reference": ref, "optimal_count": len(ref),
                        "num_qubits": n},
                worked_solution=f"{pretty(problem)}  ⟶  {pretty(ref)} ({len(ref)} gates)",
                leak_terms=[pretty(ref)] if ref else [],
            )
        raise RuntimeError("could not generate gate_simplification challenge")

    def grade(self, answer: dict, submission: dict):
        #Tier 1: multiple choice
        if "option_id" in submission:
            return grade_mc(self, answer, submission)

        #Tiers 2–3: rebuild the user's circuit from whitelisted tokens
        n = answer["num_qubits"]
        try:
            user = build(list(submission.get("circuit", []))[:MAX_TOKENS], n)
        except (ValueError, TypeError):
            return self.result(False, "invalid_circuit")
        #must do the same thing as the original circuit
        if not Operator(user).equiv(Operator(build(answer["circuit"], n))):
            return self.result(False, "not_equivalent")
        #must be no longer than the reference answer -> Shorter will also accepted
        if user.size() > answer["optimal_count"]:
            return self.result(False, "not_simplest")
        return self.result(True)

    def solution_submission(self, answer: dict) -> dict:
        if "correct_option" in answer:
            return {"option_id": answer["correct_option"]}
        return {"circuit": answer["reference"]}
