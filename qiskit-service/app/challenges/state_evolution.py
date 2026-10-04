"""Safe parsing of untrusted maths answers like '1/sqrt(3)' or '√2/2'.

Never call sympy.sympify() on user input: it uses eval() internally, so a user
could run arbitrary Python. Instead:
  1. tokenise against a strict whitelist,
  2. forbid exponents (stops DOS),
  3. parse with an empty builtins namespace and only the names we allow
"""
from __future__ import annotations

import re

import sympy as sp
from sympy.parsing.sympy_parser import (implicit_multiplication, parse_expr,
                                        standard_transformations)

MAX_LEN = 40  #longest answer that will be accepted

#Only tokens will be allowed: sqrt, the imaginary unit i, whole numbers, decimal points,
# + - * / brackets, and whitespace. Anything else is rejected before parsing.
_TOKEN = re.compile(r"sqrt|i|\d+|\.|[+\-*/()]|\s+")

#Names the parser can use. "__builtins__": {} removes Python's built in functions (open, __import__, eval...)
_SAFE_GLOBALS = {
    "__builtins__": {},
    "Integer": sp.Integer, "Float": sp.Float, "Rational": sp.Rational,
    "Symbol": sp.Symbol, "Add": sp.Add, "Mul": sp.Mul, "Pow": sp.Pow,
}
#Names users may type: i (imaginary unit) and sqrt
_LOCALS = {"i": sp.I, "sqrt": sp.sqrt}
#implicit_multiplication lets users type "2i" instead of "2*i"
_TRANSFORMS = standard_transformations + (implicit_multiplication,)


class UnsafeOrInvalidInput(ValueError):
    """Raised for any input that is unsafe, malformed or not a plain number."""
    pass


def parse_user_number(raw: str) -> sp.Expr:
    """Turn a user's typed answer into an exact SymPy number, or raise UnsafeOrInvalidInput."""
    #Reject non strings, empty input and anything too long
    if not isinstance(raw, str) or not raw.strip() or len(raw) > MAX_LEN:
        raise UnsafeOrInvalidInput("empty or too long")

    #Normalise friendly symbols: √ -> sqrt, × -> *, Unicode minus -> hyphen
    s = raw.strip().replace("√", "sqrt").replace("×", "*").replace("−", "-")
    #Add brackets so "√2" (now "sqrt2") becomes "sqrt(2)".
    s = re.sub(r"sqrt\s*(\d+)", r"sqrt(\1)", s)

    #Exponents are never needed for answers and enable huge number attacks
    if "**" in s or "^" in s:
        raise UnsafeOrInvalidInput("exponents not allowed")

    #If joining every whitelisted token doesn't rebuild the input exactly then the input contains something not on the whitelist
    if "".join(_TOKEN.findall(s)) != s:
        raise UnsafeOrInvalidInput("disallowed characters")

    #Parse in the restricted namespace. Copies are passed so the parser can't modify any dicts
    try:
        expr = parse_expr(s, local_dict=dict(_LOCALS), global_dict=dict(_SAFE_GLOBALS),
                          transformations=_TRANSFORMS, evaluate=True)
    except Exception as e:  #any parse failure is just invalid input
        raise UnsafeOrInvalidInput("could not parse") from e

    #Result must be a plain number
    if not isinstance(expr, sp.Expr) or expr.free_symbols:
        raise UnsafeOrInvalidInput("not a number")
    return expr


def equal(a: sp.Expr, b: sp.Expr) -> bool:
    """Exact equality, so different forms of the same value match (e.g. √2/2 and 1/√2)."""
    return sp.simplify(a - b) == 0


def equal_up_to_sign(a: sp.Expr, b: sp.Expr) -> bool:
    """Equal, or equal apart from an overall minus sign. In quantum states a global
    sign of -1 describes the same physical state, so both are accepted."""
    return equal(a, b) or equal(a, -b)
