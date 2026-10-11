// Routes the frontend's BB84 requests to the Qiskit service (see
// qiskit-service/README.md and docs/sprint-1/bb84-poc/TECHNICAL-ARCHITECTURE.md).
// Only the backend talks to the Qiskit service directly, keeping it off the
// public internet per the architecture doc's "Frontend / backend / Qiskit
// interaction" section.

import { NextRequest } from 'next/server';

const QISKIT_SERVICE_URL = process.env.QISKIT_SERVICE_URL ?? 'http://localhost:8000';

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({}));

    let res: Response;
    try {
        res = await fetch(`${QISKIT_SERVICE_URL}/bb84/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    } catch {
        return Response.json(
            { error: 'quantum_service_unavailable', message: 'The BB84 simulator is temporarily unavailable.' },
            { status: 503 }
        );
    }

    const data = await res.json();
    if (!res.ok) {
        return Response.json(data, { status: res.status });
    }
    return Response.json(data);
}