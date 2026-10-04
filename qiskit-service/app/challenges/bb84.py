"""BB84 with Qiskit Aer circuits + the two challenge categories built on it:
  - bb84_eve: detect, estimate or play as eavesdropper
  - sifting:  sift a key, decrypt bits, crack a word
"""
from __future__ import annotations

import random

from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

from .base import (MAX_REGEN, Challenge, ChallengeType, grade_mc, make_options,
                   register, rng_for)

#simulator instance reused by each request
_SIM = AerSimulator()
#QBER threshold
DEFAULT_THRESHOLD = 0.11


#BB84 simulation helpers


def run_bb84(n: int, intercept_rate: float, seed: int) -> list[dict]:
    """Simulate n rounds of BB84, with Eve intercepting a fraction of qubits.

    Each round is a 1 qubit circuit (one qubit sent per round). Returns one dict per round with
    Alice's bit and basis, Bob's basis and measured bit, and whether Eve intercepted.
    """
    #Seeded -> same inputs give same rounds
    rng = random.Random(f"bb84:{seed}:{intercept_rate}")
    rounds, circuits = [], []
    for i in range(n):
        #Random choices for this round. Basis "Z" = rectilinear (|0>,|1>), "X" = diagonal (|+>,|->).
        r = {
            "i": i + 1,                                   #Round number shown to users (1 based)
            "alice_bit": rng.randint(0, 1),
            "alice_basis": rng.choice("ZX"),
            "bob_basis": rng.choice("ZX"),
            "eve": rng.random() < intercept_rate,         #Does Eve intercept the qubit or not
            "eve_basis": rng.choice("ZX"),
        }

        #1 qubit, 2 classical bits: bit 0 stores Eve's measurement, bit 1 stores Bob's.
        qc = QuantumCircuit(1, 2)

        #Alice encodes her bit: X flips |0> to |1>; H moves it into the X basis.
        if r["alice_bit"]:
            qc.x(0)
        if r["alice_basis"] == "X":
            qc.h(0)

        #Eve's intercept resend attack: measure in her chosen basis, then resends
        #H before measuring = measuring in the X basis
        #H after reencodes her result back into the X basis
        if r["eve"]:
            if r["eve_basis"] == "X":
                qc.h(0)
            qc.measure(0, 0)
            if r["eve_basis"] == "X":
                qc.h(0)

        #Bob measures in his chosen basis
        if r["bob_basis"] == "X":
            qc.h(0)
        qc.measure(0, 1)

        rounds.append(r)
        circuits.append(qc)

    #Runs every round in one, seed_simulator ensures measurement outcomes are reproducible.
    res = _SIM.run(circuits, shots=1, seed_simulator=seed % (2**31)).result()
    for i, r in enumerate(rounds):
        #Each result is a bit string "c1c0"; the leftmost character is classical bit 1 (Bob's).
        bits = next(iter(res.get_counts(i)))
        r["bob_bit"] = int(bits[0])
    return rounds


def sift(rounds):
    """Keep only the rounds where Alice and Bob happened to choose the same basis."""
    return [r for r in rounds if r["alice_basis"] == r["bob_basis"]]


def qber(sifted) -> float:
    """Quantum bit error rate: fraction of sifted rounds where Bob's bit differs from Alice's."""
    return sum(r["alice_bit"] != r["bob_bit"] for r in sifted) / len(sifted) if sifted else 0.0


def pct(x: float) -> float:
    """Fraction -> percentage rounded to 1 decimal place (0.125 -> 12.5)."""
    return round(100 * x, 1)



#Challenge Category: bb84_eve

@register
class BB84EveChallenge(ChallengeType):
    name = "bb84_eve"

    # Mistake tags for category -> explanation that is rephrased by LLM after grading.
    mistakes = {
        "correct": "Correct decision: the error rate is what reveals Eve.",
        "missed_eve": "The QBER was above the abort threshold, so Alice and Bob should abort. "
                      "Without noise, any errors in the sifted key point to an eavesdropper.",
        "false_alarm": "The QBER was at or below the threshold, so the key can be kept. "
                       "Aborting here would throw away a safe key.",
        "qber_miscount": "The abort decision was right, but the QBER was miscounted. "
                         "QBER = mismatched sifted bits / total sifted bits.",
        "qber_is_rate": "QBER is not the intercept rate. Eve only causes an error when she guesses "
                        "the wrong basis (1/2) AND Bob's result then flips (1/2), so QBER ≈ rate / 4.",
        "half_not_quarter": "Close, but each intercepted qubit causes an error only 1/4 of the time "
                            "(wrong basis 1/2 × wrong result 1/2), so multiply the QBER by 4, not 2.",
        "double_counted": "That's too high. Each intercepted qubit causes an error 1/4 of the time, "
                          "so the estimate is 4 × QBER.",
        "too_greedy": "Intercepting that much pushes the expected QBER (rate / 4) over the "
                      "threshold, so Alice and Bob would detect you and abort.",
        "too_cautious": "You'd stay hidden, but you could intercept more. The expected QBER is "
                        "rate / 4, so the maximum is 4 × threshold.",
        "other": "Not quite. Recount the mismatches in the sifted key.",
    }

    def generate(self, seed: int, difficulty: int) -> Challenge:
        #Retry a new seed until the instance is usable
        for attempt in range(MAX_REGEN):
            rng = rng_for(seed, difficulty, attempt)

            #Tier 1: calculate the QBER from a sifted table and decide whether to abort
            if difficulty == 1:
                #Either no Eve at all, or a heavy attack (60–100%), so the correct decision is obvious
                p = rng.choice([0.0, rng.uniform(0.6, 1.0)])
                rounds = run_bb84(32, p, seed + attempt)
                s = sift(rounds)
                if len(s) < 10:              #Too few sifted bits to judge, try again
                    continue
                q = qber(s)
                abort = q > DEFAULT_THRESHOLD
                return Challenge(
                    self.name, 1, seed, "decision",
                    prompt_data={
                        "task": "compute_qber_and_decide",
                        "threshold_pct": pct(DEFAULT_THRESHOLD),
                        #Only sifted rounds are shown, as Alice and Bob would compare them
                        "sifted_rows": [{"round": r["i"], "alice_bit": r["alice_bit"],
                                         "bob_bit": r["bob_bit"]} for r in s],
                    },
                    answer={"qber_pct": pct(q), "abort": abort, "true_intercept_rate": p},
                    worked_solution=(f"Mismatches: {sum(r['alice_bit'] != r['bob_bit'] for r in s)} "
                                     f"of {len(s)} sifted bits → QBER = {pct(q)}%. "
                                     f"Threshold {pct(DEFAULT_THRESHOLD)}% → "
                                     f"{'abort' if abort else 'keep the key'}."),
                    leak_terms=[f"{pct(q)}%"],
                )

            #Tier 2: given the QBER, estimate Eve's intercept rate (≈ 4 × QBER), multiple choice.
            if difficulty == 2:
                p = rng.uniform(0.3, 1.0)
                #128 rounds (~64 sifted bits) keeps statistical noise in the estimate reasonable.
                rounds = run_bb84(128, p, seed + attempt)
                s = sift(rounds)
                q = qber(s)
                if not s or q == 0:          #Zero errors gives nothing to estimate from
                    continue
                #Correct estimate, rounded to the nearest 5% and capped at 100%
                est = min(100, 5 * round(4 * pct(q) / 5))
                #Distractors decided from common mistakes: QBER taken as the rate (×1),
                #half instead of a quarter (×2), or double counted (×8).
                cands = [(f"{min(100, 5 * round(pct(q) / 5))}%", "qber_is_rate"),
                         (f"{min(100, 5 * round(2 * pct(q) / 5))}%", "half_not_quarter"),
                         (f"{min(100, 5 * round(8 * pct(q) / 5))}%", "double_counted")]
                #Drop any distractor that equal answer or an earlier distractor after rounding
                seen, distractors = {f"{est}%"}, []
                for d, t in cands:
                    if d not in seen:
                        seen.add(d)
                        distractors.append((d, t))
                if len(distractors) < 2:     #Need at least 3 options in total to be used
                    continue
                options, ans = make_options(rng, f"{est}%", distractors)
                return Challenge(
                    self.name, 2, seed, "multiple_choice",
                    prompt_data={"task": "estimate_intercept_rate", "qber_pct": pct(q),
                                 "sifted_bits": len(s)},
                    answer={**ans, "estimate_pct": est, "true_intercept_rate": round(p, 3)},
                    options=options,
                    #Also reveals the true hidden rate, so users see why estimates are approximate.
                    worked_solution=(f"Each intercepted qubit causes an error with probability "
                                     f"1/2 × 1/2 = 1/4, so rate ≈ 4 × QBER = 4 × {pct(q)}% ≈ {est}%. "
                                     f"(The true hidden rate was {round(100 * p)}%; the gap is "
                                     f"statistical noise from only {len(s)} sifted bits.)"),
                    leak_terms=[f"{est}%"],
                )

            #Tier 3: play as Eve. Pick the highest intercept rate that stays under the threshold.
            #Pure maths (expected QBER = rate / 4), so no simulation is needed.
            t = rng.choice([0.05, 0.08, 0.10, 0.11, 0.15])
            max_rate = round(400 * t)        #4 × threshold, as a percentage
            return Challenge(
                self.name, 3, seed, "number",
                prompt_data={"task": "choose_intercept_rate", "threshold_pct": pct(t)},
                #Accept anything from 80% of the maximum up to maximum
                answer={"max_rate_pct": max_rate, "accept_min_pct": round(0.8 * max_rate)},
                worked_solution=(f"Expected QBER = rate / 4. To stay at or under {pct(t)}%, "
                                 f"rate ≤ 4 × {pct(t)}% = {max_rate}%. In practice Eve would "
                                 f"stay a bit lower, because short keys have noisy QBER."),
                leak_terms=[f"{max_rate}%"],
            )
        raise RuntimeError("could not generate bb84_eve challenge") #Generation error

    def grade(self, answer: dict, submission: dict) -> object:
        #Tier 2: multiple choice
        if "option_id" in submission:
            return grade_mc(self, answer, submission)

        #Tier 3: chosen intercept rate must be within accepted range
        if "rate_pct" in submission:
            rate = float(submission["rate_pct"])
            if rate > answer["max_rate_pct"]:
                return self.result(False, "too_greedy")
            if rate < answer["accept_min_pct"]:
                return self.result(False, "too_cautious")
            return self.result(True)

        #Tier 1: the abort decision must match, if a QBER was entered, it must be within 1%
        abort = bool(submission.get("abort"))
        if abort != answer["abort"]:
            return self.result(False, "missed_eve" if answer["abort"] else "false_alarm")
        if "qber_pct" in submission and abs(float(submission["qber_pct"]) - answer["qber_pct"]) > 1.0:
            return self.result(False, "qber_miscount")
        return self.result(True)

    def solution_submission(self, answer: dict) -> dict:
        #Work out the tier from the answer's fields and return correct submission for it.
        if "correct_option" in answer:
            return {"option_id": answer["correct_option"]}
        if "max_rate_pct" in answer:
            return {"rate_pct": answer["max_rate_pct"]}
        return {"abort": answer["abort"], "qber_pct": answer["qber_pct"]}


#Challenge Category: sifting


#Short words hidden in tier 3 "crack the word" challenge. Add more 3 letter words to make more robust
WORDS = ["KEY", "BIT", "EVE", "SPY", "HEX", "ZAP", "QED", "NET", "LOG", "ION", "RAY", "SUM"]


def letters_to_bits(word: str) -> str:
    """Encode each letter as 5 bits: A=00000, B=00001, … Z=11001."""
    return "".join(format(ord(c) - 65, "05b") for c in word)


def xor(a: str, b: str) -> str:
    """Bitwise XOR of two bit strings (one time pad encryption and decryption)."""
    return "".join(str(int(x) ^ int(y)) for x, y in zip(a, b))


@register
class SiftingChallenge(ChallengeType):
    name = "sifting"

    mistakes = {
        "correct": "Correct: keep only the rounds where Alice and Bob chose the same basis.",
        "kept_all": "You kept every round. Rounds where the bases differ give Bob a random "
                    "result, so they're thrown away during sifting.",
        "used_mismatched": "You kept the rounds where the bases were DIFFERENT. Sifting keeps "
                           "the rounds where they MATCH.",
        "wrong_length": "The key length is off. Count the rounds where the two bases match.",
        "not_decrypted": "That's the ciphertext unchanged. XOR each ciphertext bit with the "
                         "matching sifted key bit to decrypt.",
        "used_unsifted_key": "You XORed with Alice's raw bits. Sift first, then use the sifted key.",
        "bit_error": "Very close, but at least one bit is wrong. Recheck each position.",
        "wrong_word": "Not the right word. Sift the key, XOR it with the ciphertext, then split "
                      "into 5-bit groups (A = 00000, B = 00001, …).",
        "other": "Not quite. Start by finding the rounds where the bases match.",
    }

    def generate(self, seed: int, difficulty: int) -> Challenge:
        #Number of rounds per tier: enough sifted bits for each task, but a manageable table
        n = {1: 10, 2: 20, 3: 48}[difficulty]
        for attempt in range(MAX_REGEN):
            rng = rng_for(seed, difficulty, attempt)
            rounds = run_bb84(n, 0.0, seed + attempt)     #no Eve: sifting only
            s = sift(rounds)

            #Values used by answer and detect common mistakes when grading:
            key = "".join(str(r["alice_bit"]) for r in s)          #Correct sifted key
            table = [{"round": r["i"], "alice_bit": r["alice_bit"],
                      "alice_basis": r["alice_basis"], "bob_basis": r["bob_basis"]} for r in rounds]
            raw = "".join(str(r["alice_bit"]) for r in rounds)     #Mistake: kept every round
            mism = "".join(str(r["alice_bit"]) for r in rounds     #Mistake: kept mismatched rounds
                           if r["alice_basis"] != r["bob_basis"])
            kept = ", ".join(str(r["i"]) for r in s)               #Round numbers, for the worked solution

            #Tier 1: sift the key
            if difficulty == 1:
                #Need at least 3 kept rounds, and at least one discarded so sifting isn't trivial
                if len(s) < 3 or len(s) == n:
                    continue
                return Challenge(
                    self.name, 1, seed, "bits",
                    prompt_data={"task": "sift_key", "rounds": table},
                    answer={"bits": key, "raw": raw, "mismatched": mism},
                    worked_solution=f"Bases match in rounds {kept} → sifted key = {key}.",
                    #Very short keys are too generic for leak check
                    leak_terms=[key] if len(key) >= 4 else [],
                )

            #Tier 2: sift, then decrypt a 6 bit message with XOR
            if difficulty == 2:
                if len(s) < 6:
                    continue
                msg = "".join(rng.choice("01") for _ in range(6))   #Hidden plaintext
                cipher = xor(msg, key[:6])                          # Encrypt with sifted key
                return Challenge(
                    self.name, 2, seed, "bits",
                    prompt_data={"task": "sift_then_decrypt_bits", "rounds": table,
                                 "ciphertext": cipher},
                    #raw_xor = result of decrypting with the unsifted key (common error)
                    answer={"bits": msg, "cipher": cipher, "raw_xor": xor(cipher, raw[:6])},
                    worked_solution=(f"Sifted key (rounds {kept}) = {key}. "
                                     f"First 6 bits {key[:6]} ⊕ ciphertext {cipher} = {msg}."),
                    leak_terms=[msg],
                )

            #Tier 3: sift, decrypt 15 bits and decode a 3 letter word
            if len(s) < 15:
                continue
            word = rng.choice(WORDS)
            cipher = xor(letters_to_bits(word), key[:15])
            return Challenge(
                self.name, 3, seed, "text",
                prompt_data={"task": "crack_the_word", "rounds": table, "ciphertext": cipher,
                             "encoding": "5 bits per letter, A=00000, B=00001, … Z=11001"},
                answer={"text": word},
                worked_solution=(f"Sifted key = {key}. First 15 bits ⊕ ciphertext = "
                                 f"{letters_to_bits(word)} → {' '.join(letters_to_bits(word)[i:i+5] for i in (0, 5, 10))}"
                                 f" → {word}."),
                leak_terms=[word],
            )
        raise RuntimeError("could not generate sifting challenge")

    def grade(self, answer: dict, submission: dict):
        #Tier 3: compare the word, ignoring case and surrounding spaces.
        if "text" in answer:
            ok = str(submission.get("text", "")).strip().upper()[:10] == answer["text"]
            return self.result(ok, None if ok else "wrong_word")

        #Tiers 1 and 2: keep only 0s and 1s from the submission (max 64 characters)
        bits = "".join(ch for ch in str(submission.get("bits", ""))[:64] if ch in "01")
        if bits == answer["bits"]:
            return self.result(True)

        #Tier 2 mistakes: submitted the ciphertext unchanged, or decrypted with unsifted key
        if "cipher" in answer:
            if bits == answer["cipher"]:
                return self.result(False, "not_decrypted")
            if bits == answer["raw_xor"]:
                return self.result(False, "used_unsifted_key")
            return self.result(False, "bit_error")

        #Tier 1 mistakes: kept every round, kept the mismatched rounds, wrong length, or bit error
        if bits == answer["raw"]:
            return self.result(False, "kept_all")
        if bits == answer["mismatched"]:
            return self.result(False, "used_mismatched")
        if len(bits) != len(answer["bits"]):
            return self.result(False, "wrong_length")
        return self.result(False, "bit_error")

    def solution_submission(self, answer: dict) -> dict:
        return {"text": answer["text"]} if "text" in answer else {"bits": answer["bits"]}
