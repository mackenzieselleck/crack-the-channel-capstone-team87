// Routes the frontend's BB84 requests to the Qiskit service (see
// qiskit-service/README.md and docs/sprint-1/bb84-poc/TECHNICAL-ARCHITECTURE.md).
// Only the backend talks to the Qiskit service directly, keeping it off the
// public internet per the architecture doc's "Frontend / backend / Qiskit
// interaction" section.

import { NextRequest } from 'next/server';

const QISKIT_SERVICE_URL =
  process.env.QISKIT_SERVICE_URL ?? 'http://localhost:8000';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  // Frontend preview mode: no Python or Qiskit required.
    if (
    process.env.NODE_ENV === 'development' &&
    process.env.SIMULATOR_PREVIEW === 'true'
    ) {
    const eveActive =
      body.eavesdrop === true || body.user_role === 'eve';

    const defaultBits = [0, 1, 0, 1, 1, 0];
    const defaultAliceBases = [0, 1, 0, 1, 0, 1];
    const defaultBobBases = [0, 1, 1, 1, 0, 0];
    const defaultEveBases = [1, 0, 1, 0, 1, 0];

    const aliceBits =
      body.user_role === 'alice' && Array.isArray(body.user_bits)
        ? body.user_bits
        : defaultBits;

    const aliceBases =
      body.user_role === 'alice' && Array.isArray(body.user_bases)
        ? body.user_bases
        : defaultAliceBases;

    const bobBases =
      body.user_role === 'bob' && Array.isArray(body.user_bases)
        ? body.user_bases
        : defaultBobBases;

    const eveBases =
      body.user_role === 'eve' && Array.isArray(body.user_bases)
        ? body.user_bases
        : defaultEveBases;

    const basisSymbol = (basis: number) =>
      basis === 0 ? '+' : 'x';

    const trace = Array.from({ length: 6 }, (_, i) => {
      const aliceBit = aliceBits[i] ?? 0;
      const aliceBasis = aliceBases[i] ?? 0;
      const bobBasis = bobBases[i] ?? 0;
      const eveBasis = eveBases[i] ?? 0;

      return {
        alice_bit: aliceBit,
        alice_basis: basisSymbol(aliceBasis),
        eve_basis: eveActive ? basisSymbol(eveBasis) : null,
        eve_bit: eveActive ? aliceBit : null,
        bob_basis: basisSymbol(bobBasis),
        bob_result:
          bobBasis === aliceBasis
            ? eveActive && eveBasis !== aliceBasis && i % 2 === 0
              ? 1 - aliceBit
              : aliceBit
            : i % 2,
        kept: aliceBasis === bobBasis,
      };
    });

    return Response.json({
      num_qubits: 200,
      eavesdrop: eveActive,
      baseline_qber: 0,
      sifted_key_length: 100,
      qber: eveActive ? 0.24 : 0,
      sample_size: 50,
      errors: eveActive ? 12 : 0,
      eavesdropping_detected: eveActive,
      final_key_preview: 'a3f1c9e2',
      secure_key_preview: eveActive ? '' : '9a4e2d7b',
      secure_key_length: eveActive ? 0 : 32,
      trace,
      error_correction: {
        block_size: 4,
        leaked_bits: 12,
        corrected_errors: eveActive ? 12 : 0,
        residual_mismatches: 0,
      },
      privacy_amplification: {
        input_length: 50,
        output_length: eveActive ? 0 : 32,
        compression_ratio: eveActive ? 0 : 0.64,
      },
      mock_mode: true,
    });
  }

  // Original backend connection remains unchanged.
  let res: Response;

  try {
    res = await fetch(`${QISKIT_SERVICE_URL}/bb84/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return Response.json(
      {
        error: 'quantum_service_unavailable',
        message: 'The BB84 simulator is temporarily unavailable.',
      },
      { status: 503 },
    );
  }

  const data = await res.json();

  if (!res.ok) {
    return Response.json(data, { status: res.status });
  }

  return Response.json(data);
}
