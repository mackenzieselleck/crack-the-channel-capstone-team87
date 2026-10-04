"""Shared types and helpers for each Daily Challenge category.

Every category follows the same routing:
  generate(seed, difficulty) -> Challenge   (code computes answer)
  grade(answer, submission)  -> GradeResult (code decides correctness + mistake tag)

The LLM never sees module. It only receives Challenge.prompt_data (public)
and GradeResult.explanation (text it can then rephrase)
"""
from __future__ import annotations

import random
from dataclasses import asdict, dataclass, field
from typing import Any

#how many times a generator can retry with a new seed to find a suitable instance before failure
MAX_REGEN = 50



#data returned by generate() and grade()


@dataclass
class Challenge:
    """One generated challenge. Fields are split into public and server only data."""
    type: str                        #Category name
    difficulty: int                  #Tier 1, 2 or 3
    seed: int                        #seed used, so challenge can be regenerated
    input_kind: str                  #tells frontend which input to show:
                                     #multiple_choice | bits | text | amplitudes | circuit | decision | number
    prompt_data: dict[str, Any]      #PUBLIC: shown to user and given to the LLM
    answer: dict[str, Any]           #SERVER ONLY: never sent to browser or LLM
    options: list[dict[str, str]] = field(default_factory=list)  #PUBLIC: [{id, display}] for multiple choice
    worked_solution: str = ""        #step by step solution built in code, revealed after answering
    leak_terms: list[str] = field(default_factory=list)  #strings that would give the answer away
                                                         #LLM written text containing any is rejected

    def to_dict(self) -> dict[str, Any]:
        """Convert to a plain dict so FastAPI can return it as JSON."""
        return asdict(self)


@dataclass
class GradeResult:
    """Result of grading one submission."""
    correct: bool
    mistake_tag: str | None = None   #which misconception the user showed, e.g. "forgot_sqrt"
    explanation: str = ""            #explanation that the LLM can rephrase


#base class every category inherits from


class ChallengeType:
    name: str = ""                   #registry key, e.g. "sifting"
    mistakes: dict[str, str] = {}    #mistake tag -> explanation ("correct" and "other" included)

    def generate(self, seed: int, difficulty: int) -> Challenge:
        raise NotImplementedError

    def grade(self, answer: dict, submission: dict) -> GradeResult:
        raise NotImplementedError

    def solution_submission(self, answer: dict) -> dict:
        """Return a correct submission for this answer (used by the tests)."""
        raise NotImplementedError

    def result(self, correct: bool, tag: str | None = None) -> GradeResult:
        """Build a GradeResult, looking up the matching explanation for the tag.

        Unknown tags fall back to the category's generic "other" explanation.
        """
        key = "correct" if correct else (tag or "other")
        return GradeResult(correct, None if correct else key,
                           self.mistakes.get(key, self.mistakes.get("other", "")))



#Registry: maps category names to a single instance of each category


REGISTRY: dict[str, ChallengeType] = {}


def register(cls):
    """Class decorator: adds the category to REGISTRY so the API can find it by name."""
    REGISTRY[cls.name] = cls()
    return cls


#helpers shared by the categories


def rng_for(seed: int, difficulty: int, attempt: int = 0) -> random.Random:
    """Seeded random generator. The same seed, tier and attempt always give the same
    random sequence, which makes every challenge reproducible."""
    return random.Random(f"{seed}:{difficulty}:{attempt}")


def make_options(rng: random.Random, correct: str, distractors: list[tuple[str, str]]):
    """Shuffle the correct answer in with the distractors for a multiple choice question.

    distractors: list of (display text, mistake tag).
    Returns (public_options, answer_fields):
      public_options -> [{id, display}] safe to send to the browser (no correctness info)
      answer_fields  -> which id is correct and which mistake each wrong id represents
    """
    items = [(correct, None)] + distractors          #none marks the correct option
    rng.shuffle(items)
    ids = "abcdef"
    public = [{"id": ids[i], "display": d} for i, (d, _) in enumerate(items)]
    tags = {ids[i]: t for i, (_, t) in enumerate(items)}
    correct_id = next(k for k, t in tags.items() if t is None)
    return public, {"correct_option": correct_id, "option_tags": tags}


def grade_mc(ct: ChallengeType, answer: dict, submission: dict) -> GradeResult:
    """Grade a multiple choice submission. A wrong pick returns the mistake tag
    attached to that option when the options were made."""
    chosen = str(submission.get("option_id", ""))
    if chosen == answer["correct_option"]:
        return ct.result(True)
    return ct.result(False, answer["option_tags"].get(chosen) or "other")


def tidy_latex(s: str) -> str:
    """Match the learning modules' notation in LaTeX output."""
    #SymPy writes 1/√2 as √2/2
    s = s.replace(r"\frac{\sqrt{2}}{2}", r"\frac{1}{\sqrt{2}}")
    #SymPy uses square brackets for matrices, the modules use round brackets
    s = s.replace(r"\left[\begin{matrix}", r"\begin{pmatrix}").replace(r"\end{matrix}\right]", r"\end{pmatrix}")
    #collapse double spaces left by the replacements above
    while "  " in s:
        s = s.replace("  ", " ")
    return s
