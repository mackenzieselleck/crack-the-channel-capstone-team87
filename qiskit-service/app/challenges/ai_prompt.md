All Daily Challenge generators and graders were created using an interpretation of results from Claude Opus 5.5 after the following prompt:

"Build a Python package `challenges/` containing challenge generators and graders for a BB84/QKD learning platform with a user base of complete beginners (no quantum background). Use Qiskit, Qiskit Aer and SymPy as your main Python libraries.  API, database and frontend is out of scope, just build the generators and graders.

## Core principle
Code computes and grades every answer. An open source LLM will only rewrite user friendly text around your output. Therefore, the code should be considered the single source of truth for correctness.

## Shared contract for categories (challenges/base.py)
- `Challenge` dataclass: type, difficulty tier (1–3), seed, input_kind (multiple_choice | bits | text | amplitudes | circuit | decision | number), prompt_data (PUBLIC), answer (SERVER ONLY), options (public [{id, display}] with no correctness info), worked_solution (LaTeX/markdown built in code), leak_terms (strings that would reveal the answer). Include `to_dict()`.
- `GradeResult`: correct, mistake_tag, explanation (text written in code).
- `ChallengeType` base class with `name`, a `mistakes` dict (tag -> beginner friendly explanation, should include "correct" and "other"), `generate(seed, difficulty)`, `grade(answer, submission)`, `solution_submission(answer)` (correct submission), and a `result(correct, tag)` helper that looks up the explanation.
- A REGISTRY with a `@register` decorator, `__init__.py` will import every category module.
- Helpers: seeded `rng_for(seed, difficulty, attempt)`, `make_options()` should shuffle the correct answer into distractors and return public options plus {correct_option, option_tags}; `grade_mc()`; `tidy_latex()`.
- Should be determined per seed (seeded RNGs, `seed_simulator` for Aer). If an instance isn't suitable or lacks enough distractors, retry with a sub-seed (max 50 attempts).
- Everything should be JSON safe. Answers will be stored within a DB and later passed back to grade() as plain JSON.

## Mistake tags and distractors
Each category has a catalogue of mistake tags. Graders return  should return the specific misconception that occurred, not just if the user was right/wrong. Multiple choice distractors should be computed from real misconceptions so each wrong option maps to a misconception tag. Free text answers are matched against precomputed mistake values. If two misconceptions produce the same wrong value, keep only the first tag.

## Beginner friendly construction
- Problems should be built backwards from known results so the answer is guaranteed.
- Answers need to be hand computable by the our user base. Restrict gates to H, X, Z, CNOT (plus S in simplification), keeping amplitudes in {0, ±1, ±1/√2, ±1/2}.
- Notation should be in 1/√2 (not √2/2), round bracket pmatrix, Qiskit ordering (qubit 0 = rightmost bit).
- Graders should accept answers up to a global sign (−|ψ⟩ is the same state).

## Categories - three tiers each
1. `bb84_eve` — `run_bb84(n, intercept_rate, seed)`: one 1 qubit circuit per round, all should be run in one Aer job with shots=1. Alice: X for bit 1, H for X basis. Eve (intercept-resend): H if her basis is X, measure, H again to re-encode. Bob: H if his basis is X, measure. Also `sift()` and `qber()`.
   Tier 1 (decision): 32 rounds, Eve should either be absent or 60–100% active to make it obvious. User will compute QBER from the sifted table and decide whether to abort (11% threshold). Misconception tags: missed_eve, false_alarm, qber_miscount (QBER off by >1%).
   Tier 2 (multiple choice): 128 rounds, Eve ctivity at 30–100%. Given QBER, estimate the intercept rate ≈ 4 × QBER, rounded to 5%. Distractors: ×1 (qber_is_rate), ×2 (half_not_quarter), ×8 (double_counted). Worked solution should also reveal the true rate and explain statistical noise.
   Tier 3 (number): user plays as Eve with a random threshold from [5, 8, 10, 11, 15]%. Max rate = 4 × threshold and accept 80–100% of max. Misconception tags: too_greedy, too_cautious.
2. `sifting` — no Eve included.
   Tier 1 (bits): 10 rounds; sift the key (needs to be ≥3 kept and ≥1 discarded). Misconception tags: kept_all, used_mismatched, wrong_length, bit_error.
   Tier 2 (bits): 20 rounds; sift, then XOR decrypt 6 ciphertext bits. Misconception tags: not_decrypted (returned the ciphertext), used_unsifted_key, bit_error.
   Tier 3 (text): 48 rounds; sift, decrypt 15 bits, decode a 3 letter word (5 bits per letter, A=00000). Tag: wrong_word.
3. `state_evolution`
   Tier 1 (multiple choice): one gate (H/X/Z) on one qubit, start with |0⟩, |1⟩, |+⟩ or |−⟩, reference matrix should be shown.
   Tier 2 (multiple choice): one gate (H/X/Z/CNOT) on a 2 qubit basis state, expanded 4×4 matrix should be shown (e.g. H on qubit 0 of |00⟩ = (|00⟩+|01⟩)/√2).
   Tier 3 (amplitudes): two gates on a 2 qubit state; user can type four amplitudes in basis order 00, 01, 10, 11.
   Distractors/tags: wrong_ordering (reverse_bits), forgot_normalisation, sign_error, wrong_start, gate_not_applied, wrong_gate (T1). Compare states up to global phase. Worked solution for results should be: matrix × start vector = result = ket form.
4. `normalisation` — based off of curated amplitude sets with clean answers. Real: [1,1], [3,4], [1,2,2], [1,1,1,1], [5,12], [1,1,1], [2,2,1]. Complex: [1,i], [3,4i], [1,i,1,i], [2i,1,2], [i,1,1]. Use random signs.
   Tier 1 (multiple choice): probability of one outcome (Born rule). Misconception/Distractor tags: forgot_square, assumed_equal, forgot_normalise.
   Tier 2 (text): find N for real amplitudes. 
   Tier 3 (text): complex amplitudes. Misconception tags: forgot_sqrt, summed_amplitudes, no_reciprocal, squared_i_negative.
5. `gate_simplification` — identities as (long, short): HH=I, XX=I, ZZ=I, HXH=Z, HZH=X, SS=Z, XZX≅Z, CNOT·CNOT=I, (H⊗H)·CNOT(0→1)·(H⊗H)=CNOT(1→0).
   Tier 1 (multiple choice): "which single gate equals HXH?" Tag: wrong_gate.
   Tier 2 (circuit): 1 qubit, chain 3 identities.
    Tier 3 (circuit): 2 qubits, chain 2 identities, at least one should be two qubit.
   Shorten the reference with using a  brute force search (up to 2 gates). Require a saving of ≥3 gates. Grade with Operator.equiv. Misconception tags: not_equivalent, not_simplest (longer than reference), invalid_circuit.

## Security
- `safe_math.py`: parse free text maths without `sympify()` (as it uses eval). Whitelist tokens (digits, + - * / ( ) ., sqrt, i, √), reject `^` and `**`, cap length at 40, use `parse_expr` with an empty `__builtins__` and minimal globals, reject free symbols. Provide `equal()` and `equal_up_to_sign()`.
- Circuits are submitted as whitelisted tokens like ["h 0", "cx 0 1"], max 20, never QASM.
- the service the code will belong to is stateless, so no database or user access


## Deliverables
 `challenges`: covering all 5 categories with all 3 tiers as defined and a grader for each. If there are any open areas or clarifications needed, ask before executing anything."

 All results were reviewed prior to implementation and interpreted for best fit within the rest of the code