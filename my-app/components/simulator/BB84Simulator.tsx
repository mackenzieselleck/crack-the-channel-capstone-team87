'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  Lightbulb,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
  X,
} from 'lucide-react';

const N = 6;
const SIMULATION_QUBITS = 200;

type Role = 'alice' | 'bob' | 'eve';
type Basis = 'rect' | 'diag';
type Bit = 0 | 1;
type StatusTone = 'danger' | 'warning' | 'neutral';

interface AliceChoice {
  bit: Bit | null;
  basis: Basis | null;
}

interface ApiTraceRow {
  alice_bit: number;
  alice_basis: string;
  eve_basis: string | null;
  eve_bit: number | null;
  bob_basis: string;
  bob_result: number;
  kept: boolean;
}

interface ErrorCorrectionResult {
  block_size: number;
  leaked_bits: number;
  corrected_errors: number;
  residual_mismatches: number;
}

interface PrivacyAmplificationResult {
  input_length: number;
  output_length: number;
  compression_ratio: number;
}

interface Bb84ApiResponse {
  num_qubits: number;
  eavesdrop: boolean;
  sifted_key_length: number;
  baseline_qber: number;
  qber: number;
  sample_size: number;
  errors: number;
  eavesdropping_detected: boolean;
  final_key_preview: string;
  error_correction: ErrorCorrectionResult;
  privacy_amplification: PrivacyAmplificationResult;
  secure_key_preview: string;
  secure_key_length: number;
  trace: ApiTraceRow[];
}

interface SimulationStatus {
  title: string;
  description: string;
  tone: StatusTone;
}

const BASIS_TO_CODE: Record<Basis, number> = {
  rect: 0,
  diag: 1,
};

const stages = [
  'Transmit',
  'Measure',
  'Compare',
  'Analyse',
  'Results',
] as const;

const roleInfo = {
  alice: {
    name: 'Alice',
    subtitle: 'Sender',
    description:
      'Choose the bits and bases used to encode photons before sending them across the quantum channel.',
  },
  bob: {
    name: 'Bob',
    subtitle: 'Receiver',
    description:
      'Receive Alice’s photons and choose measurement bases without knowing which bases Alice used.',
  },
  eve: {
    name: 'Eve',
    subtitle: 'Eavesdropper',
    description:
      'Intercept photons travelling through the channel, measure them and resend them to Bob.',
  },
} satisfies Record<
  Role,
  {
    name: string;
    subtitle: string;
    description: string;
  }
>;

function emptyAliceChoices(): AliceChoice[] {
  return Array.from({ length: N }, () => ({
    bit: null,
    basis: null,
  }));
}

function emptyBasisChoices(): (Basis | null)[] {
  return Array.from({ length: N }, () => null);
}

/**
 * Generate random bits using the browser's cryptographic random number
 * generator. These fill the positions that are not shown in the UI.
 */
function randomBinaryValues(count: number): number[] {
  if (count <= 0) {
    return [];
  }

  const values = new Uint8Array(count);
  crypto.getRandomValues(values);

  return Array.from(values, (value) => value & 1);
}

/**
 * Keep the user's six visible choices at the beginning of the input,
 * then fill the rest of the 200-photon run with random values.
 */
function completeWithRandomValues(selectedValues: number[]): number[] {
  const missingCount = Math.max(
    0,
    SIMULATION_QUBITS - selectedValues.length,
  );

  return [
    ...selectedValues,
    ...randomBinaryValues(missingCount),
  ].slice(0, SIMULATION_QUBITS);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isApiTraceRow(value: unknown): value is ApiTraceRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    isFiniteNumber(row.alice_bit) &&
    typeof row.alice_basis === 'string' &&
    (typeof row.eve_basis === 'string' || row.eve_basis === null) &&
    (isFiniteNumber(row.eve_bit) || row.eve_bit === null) &&
    typeof row.bob_basis === 'string' &&
    isFiniteNumber(row.bob_result) &&
    typeof row.kept === 'boolean'
  );
}

function isErrorCorrectionResult(value: unknown): value is ErrorCorrectionResult {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    isFiniteNumber(data.block_size) &&
    isFiniteNumber(data.leaked_bits) &&
    isFiniteNumber(data.corrected_errors) &&
    isFiniteNumber(data.residual_mismatches)
  );
}

function isPrivacyAmplificationResult(
  value: unknown,
): value is PrivacyAmplificationResult {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    isFiniteNumber(data.input_length) &&
    isFiniteNumber(data.output_length) &&
    isFiniteNumber(data.compression_ratio)
  );
}

/**
 * Validate the response before using its fields in the UI.
 * This also catches mismatches between the frontend and backend.
 */
function isBb84ApiResponse(value: unknown): value is Bb84ApiResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    isFiniteNumber(data.num_qubits) &&
    typeof data.eavesdrop === 'boolean' &&
    isFiniteNumber(data.sifted_key_length) &&
    isFiniteNumber(data.baseline_qber) &&
    isFiniteNumber(data.qber) &&
    isFiniteNumber(data.sample_size) &&
    isFiniteNumber(data.errors) &&
    typeof data.eavesdropping_detected === 'boolean' &&
    typeof data.final_key_preview === 'string' &&
    isErrorCorrectionResult(data.error_correction) &&
    isPrivacyAmplificationResult(data.privacy_amplification) &&
    typeof data.secure_key_preview === 'string' &&
    isFiniteNumber(data.secure_key_length) &&
    Array.isArray(data.trace) &&
    data.trace.every(isApiTraceRow)
  );
}

function getApiErrorMessage(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) {
    return null;
  }

  const record = data as Record<string, unknown>;

  if (typeof record.message === 'string') {
    return record.message;
  }

  if (typeof record.detail === 'string') {
    return record.detail;
  }

  return null;
}

function toPercent(qber: number): number {
  return Math.round(qber * 1000) / 10;
}

export default function BB84Simulator() {
  const [role, setRole] = useState<Role | null>(null);
  const [stage, setStage] = useState(0);
  const [includeEve, setIncludeEve] = useState(false);

  const [aliceChoices, setAliceChoices] =
    useState<AliceChoice[]>(emptyAliceChoices);

  const [bobChoices, setBobChoices] =
    useState<(Basis | null)[]>(emptyBasisChoices);

  const [eveChoices, setEveChoices] =
    useState<(Basis | null)[]>(emptyBasisChoices);

  const [result, setResult] = useState<Bb84ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eveActive = role === 'eve' || includeEve;
  const progress = ((stage + 1) / stages.length) * 100;

  const aliceComplete = aliceChoices.every(
    (choice) => choice.bit !== null && choice.basis !== null,
  );

  const bobComplete = bobChoices.every((basis) => basis !== null);
  const eveComplete = eveChoices.every((basis) => basis !== null);

  const roleInputComplete =
    role === 'alice'
      ? aliceComplete
      : role === 'bob'
        ? bobComplete
        : role === 'eve'
          ? eveComplete
          : false;

  const qberPercent = result ? toPercent(result.qber) : 0;

  const status = useMemo<SimulationStatus | null>(() => {
    if (!result) {
      return null;
    }

    if (result.sample_size <= 0) {
      return {
        title: 'Insufficient sample to assess the channel',
        description:
          'No bits were available for the QBER check. The simulator cannot draw a conclusion about possible interception from this run.',
        tone: 'warning',
      };
    }

    if (!eveActive) {
      return {
        title: 'Baseline run: Eve is disabled',
        description:
          'This run shows the channel without an eavesdropper and provides a baseline for comparison. It does not test whether an interceptor can be detected.',
        tone: 'neutral',
      };
    }

    if (result.eavesdropping_detected) {
      return {
        title: 'Possible interception detected',
        description:
          'The observed QBER triggered the simulator’s 11% alert rule. This disturbance may indicate interception, but it is not proof of who or what caused the errors.',
        tone: 'danger',
      };
    }

    return {
      title: 'No clear evidence of interception in this sample',
      description:
        'The observed QBER did not reach the simulator’s 11% alert threshold. A result below this threshold does not prove that the channel is free of an eavesdropper.',
      tone: 'neutral',
    };
  }, [result, eveActive]);

  function invalidateResult() {
    setResult(null);
    setError(null);
  }

  function selectRole(selectedRole: Role) {
    setRole(selectedRole);

    if (selectedRole === 'eve') {
      setIncludeEve(true);
    }

    setStage(0);
    invalidateResult();
  }

  function updateAliceBit(index: number, bit: Bit) {
    setAliceChoices((current) =>
      current.map((choice, i) =>
        i === index ? { ...choice, bit } : choice,
      ),
    );

    invalidateResult();
  }

  function updateAliceBasis(index: number, basis: Basis) {
    setAliceChoices((current) =>
      current.map((choice, i) =>
        i === index ? { ...choice, basis } : choice,
      ),
    );

    invalidateResult();
  }

  function updateBobBasis(index: number, basis: Basis) {
    setBobChoices((current) =>
      current.map((choice, i) => (i === index ? basis : choice)),
    );

    invalidateResult();
  }

  function updateEveBasis(index: number, basis: Basis) {
    setEveChoices((current) =>
      current.map((choice, i) => (i === index ? basis : choice)),
    );

    invalidateResult();
  }

  function buildRequestBody(): Record<string, unknown> | null {
    if (!role || !roleInputComplete) {
      return null;
    }

    const body: Record<string, unknown> = {
      num_qubits: SIMULATION_QUBITS,
      eavesdrop: eveActive,
      user_role: role,
      trace_limit: N,
    };

    if (role === 'alice') {
      const selectedBits = aliceChoices.map(
        (choice) => choice.bit as Bit,
      );

      const selectedBases = aliceChoices.map(
        (choice) => BASIS_TO_CODE[choice.basis as Basis],
      );

      body.user_bits = completeWithRandomValues(selectedBits);
      body.user_bases = completeWithRandomValues(selectedBases);
    }

    if (role === 'bob') {
      const selectedBases = bobChoices.map(
        (basis) => BASIS_TO_CODE[basis as Basis],
      );

      body.user_bases = completeWithRandomValues(selectedBases);
    }

    if (role === 'eve') {
      const selectedBases = eveChoices.map(
        (basis) => BASIS_TO_CODE[basis as Basis],
      );

      body.user_bases = completeWithRandomValues(selectedBases);
    }

    return body;
  }

  async function runSimulation(): Promise<boolean> {
    const body = buildRequestBody();

    if (!body) {
      setError('Complete all your choices before running the simulation.');
      return false;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/simulator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        setError(
          getApiErrorMessage(data) ??
            'The BB84 simulator could not run. Please try again.',
        );

        return false;
      }

      if (!isBb84ApiResponse(data)) {
        setError(
          'The simulator returned an unexpected response. Check that the frontend and backend are up to date.',
        );

        return false;
      }

      setResult(data);
      return true;
    } catch {
      setError(
        'Could not connect to the BB84 simulator. Check that the backend is running and try again.',
      );

      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function nextStage() {
    if (!role) {
      return;
    }

    // Run the simulation before entering the Compare stage.
    if (stage === 1 && !result) {
      if (!roleInputComplete) {
        return;
      }

      const successful = await runSimulation();

      if (!successful) {
        return;
      }
    }

    setStage((current) => Math.min(current + 1, stages.length - 1));
  }

  function previousStage() {
    setStage((current) => Math.max(current - 1, 0));
  }

  function restart() {
    setStage(0);
    invalidateResult();

    setAliceChoices(emptyAliceChoices());
    setBobChoices(emptyBasisChoices());
    setEveChoices(emptyBasisChoices());
  }

  function changeRole() {
    setRole(null);
    setIncludeEve(false);
    restart();
  }

  if (!role) {
    return (
      <RoleSelection
        includeEve={includeEve}
        setIncludeEve={setIncludeEve}
        onSelectRole={selectRole}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-default)]">
      <SimulatorProgress stage={stage} progress={progress} />

      <div className="grid min-h-[620px] lg:grid-cols-[330px_1fr]">
        <MissionPanel
          role={role}
          stage={stage}
          eveActive={eveActive}
          onChangeRole={changeRole}
        />

        <section className="flex min-w-0 flex-col p-6 lg:p-8">
          {stage === 0 && (
            <TransmitStage
              role={role}
              aliceChoices={aliceChoices}
              eveChoices={eveChoices}
              onAliceBit={updateAliceBit}
              onAliceBasis={updateAliceBasis}
              onEveBasis={updateEveBasis}
            />
          )}

          {stage === 1 && (
            <MeasureStage
              role={role}
              bobChoices={bobChoices}
              onBobBasis={updateBobBasis}
              inputComplete={roleInputComplete}
            />
          )}

          {stage === 2 && result && (
            <CompareStage result={result} eveActive={eveActive} />
          )}

          {stage === 3 && result && (
            <AnalyseStage result={result} eveActive={eveActive} />
          )}

          {stage === 4 && result && status && (
            <ResultsStage
              result={result}
              qberPercent={qberPercent}
              status={status}
              eveActive={eveActive}
              onRestart={restart}
            />
          )}

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-[var(--error)] p-4 text-sm text-[var(--error)]"
            >
              {error}
            </div>
          )}

          {stage < stages.length - 1 && (
            <div className="mt-auto flex items-center justify-between border-t border-[var(--border-default)] pt-6">
              <button
                type="button"
                onClick={previousStage}
                disabled={stage === 0 || isLoading}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <button
                type="button"
                onClick={nextStage}
                disabled={
                  isLoading ||
                  (stage === 1 && !roleInputComplete)
                }
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-simulator)] px-5 py-2.5 text-sm font-semibold text-[var(--simulator-accent-contrast)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLoading ? 'Running Qiskit...' : 'Continue'}

                {!isLoading && <ArrowRight size={16} />}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   ROLE SELECTION
   ========================================================= */

interface RoleSelectionProps {
  includeEve: boolean;
  setIncludeEve: (enabled: boolean) => void;
  onSelectRole: (role: Role) => void;
}

function RoleSelection({
  includeEve,
  setIncludeEve,
  onSelectRole,
}: RoleSelectionProps) {
  return (
    <section className="rounded-xl border border-[var(--border-default)] p-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-simulator)]">
          Before you begin
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
          Choose your role
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
          You control one participant in a 200-photon BB84 exchange. Six
          example photons are shown for hands-on choices, while the remaining
          inputs are generated randomly.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {(Object.keys(roleInfo) as Role[]).map((role) => {
            const info = roleInfo[role];

            return (
              <button
                key={role}
                type="button"
                onClick={() => onSelectRole(role)}
                className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5 text-left transition hover:border-[var(--accent-simulator)]"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--accent-simulator)] text-sm font-bold text-[var(--accent-simulator)]">
                  {info.name[0]}
                </div>

                <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">
                  {info.subtitle}
                </p>

                <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                  Play as {info.name}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {info.description}
                </p>
              </button>
            );
          })}
        </div>

        <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 transition hover:border-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={includeEve}
            onChange={(event) => setIncludeEve(event.target.checked)}
            className="h-4 w-4 accent-[var(--accent-simulator)]"
          />

          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Include an eavesdropper
            </p>

            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Eve will intercept and resend photons during the exchange.
            </p>
          </div>
        </label>
      </div>
    </section>
  );
}

/* =========================================================
   PROGRESS
   ========================================================= */

function SimulatorProgress({
  stage,
  progress,
}: {
  stage: number;
  progress: number;
}) {
  return (
    <div className="border-b border-[var(--border-default)] px-6 py-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
          Mission Progress
        </span>

        <span className="text-xs font-semibold text-[var(--accent-simulator)]">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[var(--border-default)]">
        <div
          className="h-full rounded-full bg-[var(--accent-simulator)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 hidden grid-cols-5 gap-2 md:grid">
        {stages.map((label, index) => (
          <div
            key={label}
            className={
              index <= stage
                ? 'text-xs font-medium text-[var(--text-primary)]'
                : 'text-xs text-[var(--text-secondary)] opacity-50'
            }
          >
            {index + 1}. {label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   MISSION PANEL
   ========================================================= */

function MissionPanel({
  role,
  stage,
  eveActive,
  onChangeRole,
}: {
  role: Role;
  stage: number;
  eveActive: boolean;
  onChangeRole: () => void;
}) {
  const descriptions = [
    'Prepare the photons that will travel through the quantum channel.',
    'Measure the incoming photons without knowing the sender’s basis.',
    'Reveal the bases used and identify which positions can be kept.',
    'Compare the baseline and observed error rates to assess possible channel disturbance.',
    'Review the final outcome of the BB84 exchange.',
  ];

  return (
    <aside className="border-b border-[var(--border-default)] p-6 lg:border-b-0 lg:border-r">
      <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[var(--accent-simulator)]">
        Task {stage + 1}
      </p>

      <h2 className="mt-2 text-xl font-semibold uppercase text-[var(--text-primary)]">
        {stages[stage]}
      </h2>

      <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
        {descriptions[stage]}
      </p>

      <div className="mt-7 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
        <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">
          Your Role
        </p>

        <p className="mt-1 font-semibold text-[var(--text-primary)]">
          {roleInfo[role].name}
        </p>

        <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
          {roleInfo[role].description}
        </p>
      </div>

      {eveActive && (
        <div className="mt-4 flex gap-3 rounded-xl border border-[var(--accent-simulator)] p-4">
          <Eye
            className="mt-0.5 shrink-0 text-[var(--accent-simulator)]"
            size={18}
          />

          <div>
            <p className="text-sm font-medium text-[var(--accent-simulator)]">
              Eve is active
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
              Photons may be intercepted before reaching Bob.
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onChangeRole}
        className="mt-6 text-xs font-medium text-[var(--text-secondary)] underline-offset-4 transition hover:text-[var(--text-primary)] hover:underline"
      >
        Change role
      </button>
    </aside>
  );
}

/* =========================================================
   TRANSMIT
   ========================================================= */

function TransmitStage({
  role,
  aliceChoices,
  eveChoices,
  onAliceBit,
  onAliceBasis,
  onEveBasis,
}: {
  role: Role;
  aliceChoices: AliceChoice[];
  eveChoices: (Basis | null)[];
  onAliceBit: (index: number, bit: Bit) => void;
  onAliceBasis: (index: number, basis: Basis) => void;
  onEveBasis: (index: number, basis: Basis) => void;
}) {
  if (role === 'alice') {
    return (
      <div>
        <StageHeading
          eyebrow="Transmitter Console — Agent Alice"
          title="Encode the photons"
          description="Choose one bit and one basis for each of the six displayed photons. These choices fill the first six positions of the 200-photon run; the remaining inputs are generated randomly."
        />

        <ExplainerBox>
          BB84 encodes each bit using one of two incompatible bases: straight
          (+) or diagonal (×). Picking a basis at random, rather than always
          the same one, is what makes eavesdropping detectable later since 
          this makes it harder for an eavesdropper to guess the correct one,
          and anyone who measures a photon in the wrong basis gets a random
          result and disturbs it, making it easy to catch them!

        </ExplainerBox>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {aliceChoices.map((choice, index) => (
            <PhotonChoiceCard
              key={index}
              index={index}
              choice={choice}
              onBit={(bit) => onAliceBit(index, bit)}
              onBasis={(basis) => onAliceBasis(index, basis)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (role === 'eve') {
    return (
      <div>
        <StageHeading
          eyebrow="Channel Interceptor — Agent Eve"
          title="Intercept the photons"
          description="Choose the measurement basis for each of the six displayed photons. Eve’s bases for the remaining photons are generated randomly."
        />

        <ExplainerBox>
          To read a photon you have to measure it, and measuring forces you
          to guess — you don’t know Alice’s bases. Guess correctly and you
          learn (and can resend) the real bit undisturbed. Guess wrong and
          your measurement and the photon you pass on to Bob - carries a
          randomised bit instead. This disturbance will cause the error 
          rate to increase and make it easy for Alice and Bob to detect you.
        </ExplainerBox>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {eveChoices.map((basis, index) => (
            <BasisCard
              key={index}
              index={index}
              basis={basis}
              title="Intercepted photon"
              onBasis={(value) => onEveBasis(index, value)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <StageHeading
        eyebrow="Quantum Channel"
        title="Alice is transmitting"
        description="Alice is preparing a 200-photon run using randomly generated bits and bases. The six markers below represent example photons; Alice’s choices remain hidden from you."
      />

      <ExplainerBox>
        Alice is picking a random bit and a random basis for every
        photon she sends. You (Bob) never get to see which basis she
        picked — the secrecy is necessary for this to work. In the next
        step you’ll measure each incoming photon using your own, 
        independently guessed basis.
      </ExplainerBox>

      <HiddenPhotonRow />
    </div>
  );
}

/* =========================================================
   MEASURE
   ========================================================= */

function MeasureStage({
  role,
  bobChoices,
  onBobBasis,
  inputComplete,
}: {
  role: Role;
  bobChoices: (Basis | null)[];
  onBobBasis: (index: number, basis: Basis) => void;
  inputComplete: boolean;
}) {
  if (role === 'bob') {
    return (
      <div>
        <StageHeading
          eyebrow="Receiver Console — Agent Bob"
          title="Measure the photons"
          description="Choose a measurement basis for each of the six displayed photons. The remaining measurement bases in the 200-photon run are generated randomly."
        />

        <ExplainerBox>
          You’re guessing blind — Alice’s basis for each photon is unknown
          to you. Guess the same basis she used and your measurement
          reveals her bit exactly. Guess the other basis and you get a
          50/50 random result. The next step (compare) will involve sorting out 
          which guesses matched.
        </ExplainerBox>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {bobChoices.map((basis, index) => (
            <BasisCard
              key={index}
              index={index}
              basis={basis}
              title="Incoming photon"
              onBasis={(value) => onBobBasis(index, value)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <StageHeading
        eyebrow="Receiver Console — Agent Bob"
        title="Bob is measuring"
        description="Bob does not know Alice’s bases. The simulator generates Bob’s measurement bases and compares the results with Alice’s choices."
      />

      <ExplainerBox>
        Bob is measuring each incoming photon by guessing each
        basis, with no knowledge of what Alice (or Eve) actually
        used. Where his guess happens to match the sender’s basis, his
        result reproduces the original bit; where it doesn’t, his result is
        random.
      </ExplainerBox>

      <HiddenPhotonRow />

      <div className="mt-8 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
        <p className="text-sm text-[var(--text-secondary)]">
          {inputComplete
            ? 'Your choices are complete. Continue to run the 200-photon Qiskit simulation.'
            : 'Complete your choices before continuing.'}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   COMPARE
   ========================================================= */

function CompareStage({
  result,
  eveActive,
}: {
  result: Bb84ApiResponse;
  eveActive: boolean;
}) {
  return (
    <div>
      <StageHeading
        eyebrow="Basis Comparison"
        title="Which photons can be kept?"
        description="Alice and Bob compare their bases. Positions where their bases match can be kept for the sifted key; positions where they differ are discarded."
      />

      <ExplainerBox>
        Alice and Bob now announce only their bases over an ordinary,
        public channel. That’s safe because the basis alone tells an 
        eavesdropper nothing about the bit. Where the bases matched, 
        Bob’s result equals Alice’s bit, so that position is kept.
        Where they didn’t match, Bob’s result was essentially random noise,
        so it’s discarded rather than risking a wrong bit in the key.
      </ExplainerBox>

      <p className="mt-4 text-xs leading-5 text-[var(--text-secondary)]">
        Showing {result.trace.length} example photon
        {result.trace.length === 1 ? '' : 's'} from a{' '}
        {result.num_qubits}-photon simulation. The QBER check uses a sample
        from the larger run, not just the rows displayed here.
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-5">
        <table className="w-full min-w-[700px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border-default)] text-left text-xs uppercase tracking-wider text-[var(--text-secondary)]">
              <th className="py-4">Packet</th>
              <th className="py-4">Alice bit</th>
              <th className="py-4">Alice basis</th>
              {eveActive && <th className="py-4">Eve basis</th>}
              <th className="py-4">Bob basis</th>
              <th className="py-4">Bob result</th>
              <th className="py-4">Decision</th>
            </tr>
          </thead>

          <tbody>
            {result.trace.map((row, index) => (
              <tr
                key={index}
                className="border-b border-[var(--border-default)] last:border-b-0"
              >
                <td className="py-4 text-[var(--text-primary)]">
                  {index + 1}
                </td>

                <td className="text-[var(--text-primary)]">
                  {row.alice_bit}
                </td>

                <td>
                  <BasisBadge basis={row.alice_basis} />
                </td>

                {eveActive && (
                  <td>
                    {row.eve_basis ? (
                      <BasisBadge basis={row.eve_basis} />
                    ) : (
                      <span className="text-[var(--text-secondary)]">
                        —
                      </span>
                    )}
                  </td>
                )}

                <td>
                  <BasisBadge basis={row.bob_basis} />
                </td>

                <td className="text-[var(--text-primary)]">
                  {row.bob_result}
                </td>

                <td>
                  {row.kept ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-[var(--success)]">
                      <Check size={15} />
                      Keep
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                      <X size={15} />
                      Discard
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   ANALYSE
   ========================================================= */

function AnalyseStage({
  result,
  eveActive,
}: {
  result: Bb84ApiResponse;
  eveActive: boolean;
}) {
  const qberPercent = toPercent(result.qber);
  const baselinePercent = toPercent(result.baseline_qber);
  const delta = Math.round(
    (result.qber - result.baseline_qber) * 1000,
  ) / 10;

  const deltaText = `${delta > 0 ? '+' : ''}${delta.toFixed(1)} percentage points`;

  return (
    <div>
      <StageHeading
        eyebrow="Security Check"
        title="Analyse the quantum channel"
        description="Compare the no-Eve baseline with the observed error rate. Interception can disturb photon measurements and increase the quantum bit error rate (QBER)."
      />

      <ExplainerBox title="How QBER is calculated">
        Half of the kept (sifted) bits are set aside purely as a public
        check sample and are never used in the key. QBER is simply the
        share of that sample where Alice’s and Bob’s bits disagree. An
        intercept-resend eavesdropper has to guess a basis too: guess wrong
        and the error rate is increased toward roughly 25%, far above the small
        error rate expected on an unmonitored channel. The 11% threshold
        below is a conservative tripwire for that disturbance.
      </ExplainerBox>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Photons simulated"
          value={String(result.num_qubits)}
        />

        <Metric
          label="Sifted key"
          value={`${result.sifted_key_length} bits`}
        />

        <Metric
          label="Errors detected"
          value={String(result.errors)}
        />

        <Metric
          label="QBER sample"
          value={`${result.sample_size} bits`}
        />
      </div>

      <QberComparison
        baselinePercent={baselinePercent}
        observedPercent={qberPercent}
        deltaText={deltaText}
        eveActive={eveActive}
        eavesdroppingDetected={result.eavesdropping_detected}
      />

      {result.sample_size <= 0 ? (
        <div className="mt-6 rounded-xl border border-[var(--border-default)] p-5">
          <p className="font-medium text-[var(--text-primary)]">
            QBER is inconclusive
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            The simulator did not have any bits available for its QBER sample.
            A zero QBER value in this situation should not be interpreted as
            proof that the channel is secure.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <div className="mb-3 flex justify-between gap-4 text-sm">
            <span className="text-[var(--text-secondary)]">
              Observed quantum bit error rate
            </span>
            <span className="font-semibold text-[var(--text-primary)]">
              {qberPercent.toFixed(1)}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-[var(--border-default)]">
            <div
              className={
                result.eavesdropping_detected && eveActive
                  ? 'h-full rounded-full bg-[var(--error)] transition-all'
                  : 'h-full rounded-full bg-[var(--accent-simulator)] transition-all'
              }
              style={{
                width: `${Math.min(Math.max(qberPercent, 0), 100)}%`,
              }}
            />
          </div>

          <p className="mt-4 text-xs leading-5 text-[var(--text-secondary)]">
            The simulator uses an 11% alert threshold. This is a learning
            aid, not a universal security guarantee. A high QBER can indicate
            disturbance, while a low QBER does not prove that no
            eavesdropping occurred.
          </p>
        </div>
      )}
    </div>
  );
}

function QberComparison({
  baselinePercent,
  observedPercent,
  deltaText,
  eveActive,
  eavesdroppingDetected,
}: {
  baselinePercent: number;
  observedPercent: number;
  deltaText: string;
  eveActive: boolean;
  eavesdroppingDetected: boolean;
}) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
        Baseline vs observed QBER
      </h3>

      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
        The baseline is the estimated QBER for the same exchange without
        Eve. The observed value comes from the configured run
        {eveActive ? ' with Eve active' : ' with Eve disabled'}.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <QberCard
          label="Baseline (Eve off)"
          percent={baselinePercent}
          barClass="bg-[var(--accent-learning)]"
          description="Counterfactual no-eavesdropper baseline"
        />

        <QberCard
          label={eveActive ? 'Observed (Eve on)' : 'Observed (Eve off)'}
          percent={observedPercent}
          barClass={
            eveActive && eavesdroppingDetected
              ? 'bg-[var(--error)]'
              : 'bg-[var(--accent-simulator)]'
          }
          description="QBER measured for this simulation run"
        />
      </div>

      <div className="mt-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Change from baseline
        </p>

        <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
          {deltaText}
        </p>

        <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
          {eveActive
            ? 'A positive difference means the observed QBER is higher than the no-Eve baseline. The amount can vary between runs because the photon bases and measurements are random.'
            : 'Eve is disabled, so this run is intended to provide a baseline rather than test interception.'}
        </p>
      </div>
    </div>
  );
}

function QberCard({
  label,
  percent,
  barClass,
  description,
}: {
  label: string;
  percent: number;
  barClass: string;
  description: string;
}) {
  const boundedPercent = Math.min(Math.max(percent, 0), 100);

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
      <p className="text-sm font-medium text-[var(--text-secondary)]">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">
        {percent.toFixed(1)}%
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--border-default)]">
        <div
          className={`h-full rounded-full transition-all ${barClass}`}
          style={{ width: `${boundedPercent}%` }}
        />
      </div>

      <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   RESULTS
   ========================================================= */

function ResultsStage({
  result,
  qberPercent,
  status,
  eveActive,
  onRestart,
}: {
  result: Bb84ApiResponse;
  qberPercent: number;
  status: SimulationStatus;
  eveActive: boolean;
  onRestart: () => void;
}) {
  const canShowKeyPreview =
    result.sample_size > 0 &&
    !(eveActive && result.eavesdropping_detected);

  const statusBorderClass =
    status.tone === 'danger'
      ? 'border-[var(--error)]'
      : status.tone === 'warning'
        ? 'border-[var(--accent-simulator)]'
        : 'border-[var(--border-default)]';

  const statusIconClass =
    status.tone === 'danger'
      ? 'text-[var(--error)]'
      : status.tone === 'warning'
        ? 'text-[var(--accent-simulator)]'
        : 'text-[var(--text-secondary)]';

  return (
    <div>
      <StageHeading
        eyebrow="Mission Complete"
        title="Key exchange result"
        description="Review the simulation outcome and what the error rate can tell you about the channel."
      />

      <ExplainerBox title="From sifted bits to a secure key">
        The sifted key still has a few mismatches between Alice and Bob,
        from ordinary noise or from Eve. Error correction (a simplified
        Cascade protocol) finds and fixes those by comparing block parities
        over the public channel — each comparison leaks a little
        information to a possible eavesdropper, which is tracked below.
        Privacy amplification then compresses the corrected key using a
        random hash, shrinking it by exactly enough to wash out whatever
        fragments Eve might have picked up. What’s left is the secure key.
      </ExplainerBox>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Leaked bits (error correction)"
          value={String(result.error_correction.leaked_bits)}
        />

        <Metric
          label="Errors corrected"
          value={String(result.error_correction.corrected_errors)}
        />

        <Metric
          label="Residual mismatches"
          value={String(result.error_correction.residual_mismatches)}
        />

        <Metric
          label="Privacy amplification"
          value={`${result.privacy_amplification.input_length} → ${result.privacy_amplification.output_length} bits`}
        />
      </div>

      <div className={`mt-8 rounded-xl border p-6 ${statusBorderClass}`}>
        <div className="flex gap-4">
          {status.tone === 'neutral' && !eveActive ? (
            <Eye className={`shrink-0 ${statusIconClass}`} size={26} />
          ) : status.tone === 'danger' || status.tone === 'warning' ? (
            <TriangleAlert
              className={`shrink-0 ${statusIconClass}`}
              size={26}
            />
          ) : (
            <ShieldCheck
              className={`shrink-0 ${statusIconClass}`}
              size={26}
            />
          )}

          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {status.title}
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              {status.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Metric
          label="Photons sent"
          value={String(result.num_qubits)}
        />

        <Metric
          label="Bits sifted"
          value={String(result.sifted_key_length)}
        />

        <Metric
          label="Errors"
          value={String(result.errors)}
        />

        <Metric
          label="QBER"
          value={`${qberPercent.toFixed(1)}%`}
        />

        <Metric
          label="QBER sample"
          value={`${result.sample_size} bits`}
        />
      </div>

      <div className="mt-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
        <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">
          Simulated key preview
        </p>

        {canShowKeyPreview ? (
          <>
            <p className="mt-2 break-all font-mono text-lg tracking-[0.15em] text-[var(--text-primary)]">
              {result.secure_key_preview || 'No key preview available'}
            </p>

            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              Simulated key length: {result.secure_key_length} bits
            </p>

            <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">
              This is illustrative output from the simulator, not a
              guarantee of real-world security. A QBER result below the
              alert threshold does not prove the key is secure.
            </p>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
              Key preview withheld
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {result.sample_size <= 0
                ? 'There was no usable QBER sample, so this run cannot establish whether the exchange is safe.'
                : 'The QBER alert was triggered while Eve was active. Do not treat the generated key as secure.'}
            </p>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        <RotateCcw size={16} />
        Run again
      </button>
    </div>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
   ========================================================= */

function StageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-simulator)]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
        {description}
      </p>
    </div>
  );
}

/**
 * Short "why this step matters" callout. Used under the stage heading on
 * every step so the mechanics (what you're clicking) are paired with the
 * reasoning (why BB84 works) 
 */
function ExplainerBox({
  title = 'Why this step',
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-6 flex gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
      <Lightbulb
        className="mt-0.5 shrink-0 text-[var(--accent-simulator)]"
        size={18}
      />

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-simulator)]">
          {title}
        </p>

        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          {children}
        </p>
      </div>
    </div>
  );
}

function PhotonChoiceCard({
  index,
  choice,
  onBit,
  onBasis,
}: {
  index: number;
  choice: AliceChoice;
  onBit: (bit: Bit) => void;
  onBasis: (basis: Basis) => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
        Packet {index + 1}
      </p>

      <p className="mb-2 mt-4 text-xs text-[var(--text-secondary)]">
        Bit
      </p>

      <div className="grid grid-cols-2 gap-2">
        {([0, 1] as Bit[]).map((bit) => (
          <ChoiceButton
            key={bit}
            selected={choice.bit === bit}
            onClick={() => onBit(bit)}
          >
            {bit}
          </ChoiceButton>
        ))}
      </div>

      <p className="mb-2 mt-4 text-xs text-[var(--text-secondary)]">
        Basis
      </p>

      <div className="grid grid-cols-2 gap-2">
        <ChoiceButton
          selected={choice.basis === 'rect'}
          onClick={() => onBasis('rect')}
        >
          + Straight
        </ChoiceButton>

        <ChoiceButton
          selected={choice.basis === 'diag'}
          onClick={() => onBasis('diag')}
        >
          × Diagonal
        </ChoiceButton>
      </div>
    </div>
  );
}

function BasisCard({
  index,
  basis,
  title,
  onBasis,
}: {
  index: number;
  basis: Basis | null;
  title: string;
  onBasis: (basis: Basis) => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
      <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">
        Packet {index + 1}
      </p>

      <h3 className="mt-2 text-sm font-medium text-[var(--text-primary)]">
        {title}
      </h3>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <ChoiceButton
          selected={basis === 'rect'}
          onClick={() => onBasis('rect')}
        >
          + Straight
        </ChoiceButton>

        <ChoiceButton
          selected={basis === 'diag'}
          onClick={() => onBasis('diag')}
        >
          × Diagonal
        </ChoiceButton>
      </div>
    </div>
  );
}

function ChoiceButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-xl border px-3 py-2 text-sm transition',
        selected
          ? 'border-[var(--accent-simulator)] text-[var(--accent-simulator)]'
          : 'border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--text-secondary)]',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function HiddenPhotonRow() {
  return (
    <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-6">
      {Array.from({ length: N }, (_, index) => (
        <div
          key={index}
          className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-card)]"
        >
          <div className="text-center">
            <div className="mx-auto h-3 w-3 rounded-full bg-[var(--text-secondary)]" />

            <p className="mt-2 text-[10px] text-[var(--text-secondary)]">
              {index + 1}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function BasisBadge({ basis }: { basis: string }) {
  const straight = basis === '+';

  return (
    <span className="inline-flex min-w-20 items-center justify-center rounded-md border border-[var(--border-default)] px-2 py-1 text-xs text-[var(--text-secondary)]">
      {straight ? '+ Straight' : '× Diagonal'}
    </span>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
      <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  );
}
