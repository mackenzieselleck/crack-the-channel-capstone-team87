"""Normalisation and measurement probability (Born rule).

Uses exact SymPy maths, so '√2/2' and '1/sqrt(2)' are both accepted.
Amplitude sets are curated so answers stay manageable (1/5, 1/3, 1/√2, 1/2, 1/13).
"""
from __future__ import annotations

import sympy as sp

from .base import (tidy_latex, MAX_REGEN, Challenge, ChallengeType, grade_mc, make_options,
                   register, rng_for)
from .safe_math import (UnsafeOrInvalidInput, equal, equal_up_to_sign,
                        parse_user_number)

I = sp.I  #imaginary unit


def L(e) -> str:
    """SymPy expression -> LaTeX in the modules' notation."""
    return tidy_latex(sp.latex(e))


#Curated amplitude sets. The sum of squared magnitudes is always a square number or
#a small integer, so normalisation constants stay manageable, e.g. [3, 4]: 9 + 16 = 25 -> N = 1/5.
REAL_SETS = [[1, 1], [3, 4], [1, 2, 2], [1, 1, 1, 1], [5, 12], [1, 1, 1], [2, 2, 1]]
COMPLEX_SETS = [[1, I], [3, 4 * I], [1, I, 1, I], [2 * I, 1, 2], [I, 1, 1]]


def state_latex(amps, labels) -> str:
    """Write a state in ket notation, e.g. 3|0⟩ - 4|1⟩."""
    out = []
    for a, lab in zip(amps, labels):
        #Hide a coefficient of 1, write -1 as "-", and bracket sums like (1+i).
        c = "" if a == 1 else "-" if a == -1 else f"({L(a)})" if a.is_Add else L(a)
        out.append(f"{c}|{lab}\\rangle")
    return tidy_latex(" + ".join(out).replace("+ -", "- "))


def labels_for(rng, k: int) -> list[str]:
    """Basis labels for k amplitudes: one qubit for 2 amplitudes, otherwise k of the 4 two-qubit states."""
    if k == 2:
        return ["0", "1"]
    return sorted(rng.sample(["00", "01", "10", "11"], k))


@register
class NormalisationChallenge(ChallengeType):
    name = "normalisation"

    mistakes = {
        "correct": "Correct: the squared magnitudes of the amplitudes must add up to 1.",
        "forgot_sqrt": "You found 1 / (sum of squares), but N needs a square root: "
                       "N = 1 / √(sum of |amplitude|²).",
        "summed_amplitudes": "You added the amplitudes themselves. Normalisation uses the SQUARED "
                             "magnitudes: |a|² + |b|² + … = 1.",
        "no_reciprocal": "That's the length of the vector. N is its reciprocal, 1 / length.",
        "squared_i_negative": "For complex amplitudes use |a|² = a × a*, so |i|² = 1, not i² = −1.",
        "forgot_square": "Probability is the amplitude SQUARED (Born rule), not the amplitude itself.",
        "assumed_equal": "The outcomes aren't equally likely here. Square each amplitude to get "
                         "its probability.",
        "forgot_normalise": "Normalise the state first. Probabilities must add up to 1.",
        "unparseable": "Couldn't read that. Use forms like 1/sqrt(3), sqrt(2)/2 or 1/5.",
        "other": "Not quite. Add up the squared magnitudes, square-root, then take 1 / that.",
    }

    def generate(self, seed: int, difficulty: int) -> Challenge:
        for attempt in range(MAX_REGEN):
            rng = rng_for(seed, difficulty, attempt)

            #Pick amplitudes: complex for tier 3, real otherwise, each with a random sign
            base = rng.choice(COMPLEX_SETS if difficulty == 3 else REAL_SETS)
            amps = [sp.Integer(a) * rng.choice([1, -1]) if not isinstance(a, sp.Expr) or a.is_real
                    else a * rng.choice([1, -1]) for a in base]
            amps = [sp.sympify(a) for a in amps]
            labels = labels_for(rng, len(amps))

            #Normalisation constant: N = 1 / √(sum of |amplitude|²).
            norm_sq = sum(sp.Abs(a) ** 2 for a in amps)
            N = sp.nsimplify(1 / sp.sqrt(norm_sq))
            unnorm = state_latex(amps, labels)    #unnormalised state, for display

            #Tier 1: probability of one measurement outcome (multiple choice)
            if difficulty == 1:
                k = rng.randrange(len(amps))                   #which outcome to ask about
                normed = [sp.simplify(N * a) for a in amps]    #normalised amplitudes (shown to the user)
                p = sp.simplify(sp.Abs(normed[k]) ** 2)        #Born rule: P = |amplitude|²
                # Distractors from common mistakes.
                cands = [(sp.Abs(normed[k]), "forgot_square"),               #forgot to square
                         (sp.Rational(1, len(amps)), "assumed_equal"),       #assumed all outcomes equal
                         (sp.Abs(amps[k]) ** 2, "forgot_normalise")]         #squared the unnormalised value
                #Keep only distractors that differ from the answer and each other
                distractors, seen = [], [p]
                for v, t in cands:
                    v = sp.nsimplify(v)
                    if not any(equal(v, s) for s in seen):
                        seen.append(v)
                        distractors.append((f"${L(v)}$", t))
                if len(distractors) < 2:
                    continue
                options, mc = make_options(rng, f"${L(p)}$", distractors)
                shown = state_latex(normed, labels)
                return Challenge(
                    self.name, 1, seed, "multiple_choice",
                    prompt_data={"task": "measurement_probability", "state": shown,
                                 "outcome": labels[k]},
                    answer={**mc, "probability": str(p)}, options=options,
                    worked_solution=(f"P({labels[k]}) = |{L(normed[k])}|^2 = {L(p)}"),
                    leak_terms=[L(p)],
                )

            #Tiers 2–3: find N (free text answer). Pre compute values for common mistakes
            #Wrong answer can be matched to specific misconceptions
            wrong = {
                "forgot_sqrt": sp.nsimplify(1 / norm_sq),          #1 / sum, no square root
                "no_reciprocal": sp.nsimplify(sp.sqrt(norm_sq)),   #√sum, not 1/√sum
            }
            s = sum(amps)
            if s != 0 and s.is_real:
                #Added amplitudes instead of their squares
                wrong["summed_amplitudes"] = sp.nsimplify(1 / sp.Abs(s))
            if difficulty == 3:
                #Squared i as -1 (used a² instead of |a|²) will only  bemeaningful if it gives a different value
                sq = sum(a ** 2 for a in amps)
                if sq != 0 and sp.simplify(sq - norm_sq) != 0 and sq.is_positive:
                    wrong["squared_i_negative"] = sp.nsimplify(1 / sp.sqrt(sq))
            # Drop any mistakes whose value equals the answer or an earlier mistake
            dedup: dict[str, sp.Expr] = {}
            for t, v in wrong.items():
                if not equal_up_to_sign(v, N) and not any(equal_up_to_sign(v, w) for w in dedup.values()):
                    dedup[t] = v
            wrong = dedup

            squares = " + ".join(f"|{L(a)}|^2" for a in amps)   #for worked solution
            return Challenge(
                self.name, difficulty, seed, "text",
                prompt_data={"task": "find_normalisation_constant",
                             "state": f"N\\left({unnorm}\\right)",
                             "input_hint": "e.g. 1/sqrt(3) or sqrt(2)/2"},
                #Stored as strings so the answer is JSON compatible
                answer={"N": str(N), "wrong": {t: str(v) for t, v in wrong.items()}},
                worked_solution=(f"{squares} = {L(norm_sq)}, so "
                                 f"N = \\frac{{1}}{{\\sqrt{{{L(norm_sq)}}}}} = {L(N)}"),
                leak_terms=[L(N)],
            )
        raise RuntimeError("could not generate normalisation challenge")

    def grade(self, answer: dict, submission: dict):
        #Tier 1: multiple choice.
        if "option_id" in submission:
            return grade_mc(self, answer, submission)

        #Tiers 2–3: parse typed answer
        try:
            user = parse_user_number(str(submission.get("text", "")))
        except UnsafeOrInvalidInput:
            return self.result(False, "unparseable")
        #Accept N or -N (a global sign doesn't change the state)
        if equal_up_to_sign(user, sp.sympify(answer["N"])):
            return self.result(True)
        #If answer matches known mistake return mistake tag
        for tag, v in answer["wrong"].items():
            if equal_up_to_sign(user, sp.sympify(v)):
                return self.result(False, tag)
        return self.result(False, "other")

    def solution_submission(self, answer: dict) -> dict:
        if "correct_option" in answer:
            return {"option_id": answer["correct_option"]}
        return {"text": answer["N"]}
