import pytest
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_bb84_endpoint_returns_expected_response_shape():
    response = client.post(
        "/bb84/run",
        json={"num_qubits": 20, "seed": 42, "trace_limit": 5},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["num_qubits"] == 20
    assert body["eavesdrop"] is False
    assert len(body["trace"]) == 5
    assert "qber" in body
    assert "error_correction" in body
    assert "privacy_amplification" in body
    assert "secure_key_length" in body


@pytest.mark.parametrize(
    "payload",
    [
        {"num_qubits": 1},
        {"num_qubits": 5001},
        {"user_role": "alice", "num_qubits": 2, "user_bases": [0, 1]},
        {
            "user_role": "alice",
            "num_qubits": 2,
            "user_bases": [0, 2],
            "user_bits": [0, 1],
        },
        {
            "user_role": "eve",
            "num_qubits": 2,
            "eavesdrop": False,
            "user_bases": [0, 1],
        },
    ],
)
def test_bb84_endpoint_rejects_invalid_requests(payload):
    response = client.post("/bb84/run", json=payload)

    assert response.status_code == 422
