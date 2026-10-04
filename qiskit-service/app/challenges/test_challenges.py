"""Run with: pytest -q

Checks every category × tier over many seeds: generates, serialises to JSON,
accepts the correct answer, and never leaks answer fields into public data.
Also tests determinism, mistake tagging and the safe maths parser.
"""
import json

import pytest

#used to confirm interpreted code works as intended

from app.challenges import REGISTRY
from app.challenges.safe_math import UnsafeOrInvalidInput, parse_user_number

SEEDS = range(15)  #seeds tests per category and tier


@pytest.mark.parametrize("name", sorted(REGISTRY))
@pytest.mark.parametrize("difficulty", [1, 2, 3])
def test_generate_and_grade(name, difficulty):
    """Every generated challenge must round trip through JSON (as it does via the database),
    accept its own correct answer, and keep correctness info out of public fields."""
    ct = REGISTRY[name]
    for seed in SEEDS:
        ch = ct.generate(seed, difficulty)
        d = json.loads(json.dumps(ch.to_dict()))        #must be JSON serialisable
        assert ct.grade(d["answer"], ct.solution_submission(d["answer"])).correct, (name, seed)
        public = json.dumps({"p": d["prompt_data"], "o": d["options"]})
        assert "option_tags" not in public and "correct_option" not in public


@pytest.mark.parametrize("name", sorted(REGISTRY))
def test_deterministic(name):
    """The same seed and tier must always produce the same challenge."""
    ct = REGISTRY[name]
    assert ct.generate(7, 2).to_dict() == ct.generate(7, 2).to_dict()


def test_wrong_answers_tagged():
    """Typing a known mistake's value must return that mistake's tag."""
    ct = REGISTRY["normalisation"]
    for seed in SEEDS:
        a = ct.generate(seed, 2).answer
        for tag, v in a["wrong"].items():
            r = ct.grade(a, {"text": v})
            assert not r.correct and r.mistake_tag == tag
    sift = REGISTRY["sifting"]
    a = sift.generate(1, 1).answer
    assert sift.grade(a, {"bits": a["raw"]}).mistake_tag == "kept_all"


#Equivalent answer formats users might type must all be accepted
@pytest.mark.parametrize("ok", ["1/sqrt(3)", "√2/2", "sqrt(2)/2", "1/5", "-1/2", "2i", "i/sqrt(2)"])
def test_safe_math_accepts(ok):
    parse_user_number(ok)


#Code injection, DoS, variables, over long and empty input must all be rejected
@pytest.mark.parametrize("bad", ["__import__('os')", "9**9**9", "2^999999", "x+1",
                                 "exec('1')", "a" * 100, "", "lambda: 1", "().__class__"])
def test_safe_math_rejects(bad):
    with pytest.raises(UnsafeOrInvalidInput):
        parse_user_number(bad)
