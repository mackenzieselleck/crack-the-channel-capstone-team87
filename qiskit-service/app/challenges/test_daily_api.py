"""In-process HTTP checks using the real FastAPI router and Qiskit graders.

TestClient does not start a separate network service or a live Next/Supabase
stack. A test-only internal key is restored after each test.
"""
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.challenges import REGISTRY, api


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(api, "INTERNAL_KEY", "daily-qa-fixture-key")
    application = FastAPI()
    application.include_router(api.router)
    with TestClient(application) as test_client:
        yield test_client


HEADERS = {"x-api-key": "daily-qa-fixture-key"}


@pytest.mark.parametrize("headers", [{}, {"x-api-key": "wrong"}])
def test_service_rejects_missing_or_wrong_internal_key(client, headers):
    response = client.post("/challenges/generate", headers=headers,
                           json={"type": "sifting", "seed": 87, "difficulty": 1})
    assert response.status_code == 401


@pytest.mark.parametrize("difficulty", [0, 4])
def test_service_rejects_out_of_range_tiers(client, difficulty):
    response = client.post("/challenges/generate", headers=HEADERS,
                           json={"type": "sifting", "seed": 87, "difficulty": difficulty})
    assert response.status_code == 422


def test_unknown_category_has_a_controlled_http_error(client):
    response = client.post("/challenges/generate", headers=HEADERS,
                           json={"type": "not-a-category", "seed": 87, "difficulty": 1})
    assert response.status_code == 404


@pytest.mark.parametrize("name", sorted(REGISTRY))
def test_generation_and_grading_http_roundtrip_for_every_available_category(client, name):
    generated = client.post("/challenges/generate", headers=HEADERS,
                            json={"type": name, "seed": 87, "difficulty": 3})
    assert generated.status_code == 200
    challenge = generated.json()
    response = client.post("/challenges/grade", headers=HEADERS,
                           json={"type": name, "answer": challenge["answer"],
                                 "submission": REGISTRY[name].solution_submission(challenge["answer"])})
    assert response.status_code == 200
    assert response.json()["correct"] is True


@pytest.mark.parametrize("token", ["", "   "])
def test_blank_circuit_token_is_an_invalid_grade_instead_of_http_500(client, token):
    answer = {"circuit": ["h 0", "h 0"], "reference": [], "optimal_count": 0, "num_qubits": 1}
    response = client.post("/challenges/grade", headers=HEADERS,
                           json={"type": "gate_simplification", "answer": answer, "submission": {"circuit": [token]}})
    assert response.status_code == 200
    assert response.json()["correct"] is False
    assert response.json()["mistake_tag"] == "invalid_circuit"
