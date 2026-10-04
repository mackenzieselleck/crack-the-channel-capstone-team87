"""Daily Challenge endpoints, mounted into existing FastAPI app in main.py.

Only Next.js server routes call these, never the browser, because
/challenges/generate returns answers. All endpoints require internal API key.
"""
from __future__ import annotations

import hmac
import os
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field

from challenges import REGISTRY

# Shared secret known only to this service and Next.js server
INTERNAL_KEY = os.environ.get("INTERNAL_API_KEY", "")


def require_key(x_api_key: str | None = Header(None)):
    """Reject the request unless it has the correct x-api-key header.
    compare_digest stops the key being guessed from response timing.
    If no key is configured, every request is rejected."""
    if not INTERNAL_KEY or not x_api_key or not hmac.compare_digest(x_api_key, INTERNAL_KEY):
        raise HTTPException(status_code=401, detail="unauthorised")


# every route in router requires API key and is served under /challenges
router = APIRouter(prefix="/challenges", tags=["daily-challenge"],
                   dependencies=[Depends(require_key)])


class GenerateReq(BaseModel):
    type: str                                   # category name
    seed: int = Field(ge=0, le=2**40)
    difficulty: int = Field(ge=1, le=3)


class GradeReq(BaseModel):
    type: str
    answer: dict[str, Any]          # loaded server side from Supabase
    submission: dict[str, Any]      # already shape checked by Next.js


@router.get("/types")
def types():
    """List every registered challenge category."""
    return sorted(REGISTRY)


@router.post("/generate")
def generate(req: GenerateReq):
    """Generate one challenge, including its answer."""
    ct = REGISTRY.get(req.type)
    if not ct:
        raise HTTPException(404, "unknown challenge type")
    return ct.generate(req.seed, req.difficulty).to_dict()


@router.post("/grade")
def grade(req: GradeReq):
    """Grade a submission against a stored answer."""
    ct = REGISTRY.get(req.type)
    if not ct:
        raise HTTPException(404, "unknown challenge type")
    r = ct.grade(req.answer, req.submission)
    return {"correct": r.correct, "mistake_tag": r.mistake_tag, "explanation": r.explanation}