'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
  X,
} from 'lucide-react';

const N = 6;

type Role = 'alice' | 'bob' | 'eve';
type Basis = 'rect' | 'diag';
type Bit = 0 | 1;

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

interface Bb84ApiResponse {
  num_qubits: number;
  eavesdrop: boolean;
  sifted_key_length: number;
  qber: number;
  sample_size: number;
  errors: number;
  eavesdropping_detected: boolean;
  final_key_preview: string;
  secure_key_preview: string;
  secure_key_length: number;
  trace: ApiTraceRow[];
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
      'Receive Alice’s photons and choose a measurement basis without knowing which basis Alice used.',
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

  const [result, setResult] =
    useState<Bb84ApiResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const eveActive =
    role === 'eve' || includeEve;

  const progress =
    ((stage + 1) / stages.length) * 100;

  const aliceComplete =
    aliceChoices.every(
      (choice) =>
        choice.bit !== null &&
        choice.basis !== null,
    );

  const bobComplete =
    bobChoices.every(
      (basis) => basis !== null,
    );

  const eveComplete =
    eveChoices.every(
      (basis) => basis !== null,
    );

  const roleInputComplete =
    role === 'alice'
      ? aliceComplete
      : role === 'bob'
        ? bobComplete
        : role === 'eve'
          ? eveComplete
          : false;

  const qberPercent = result
    ? Math.round(result.qber * 1000) / 10
    : 0;

  const status = useMemo(() => {
    if (!result) {
      return null;
    }

    if (result.eavesdropping_detected) {
      return {
        title:
          'Possible interception detected',

        description:
          'Errors were detected in the sifted key. The disturbance may indicate that the quantum channel was intercepted.',

        danger: true,
      };
    }

    return {
      title:
        'No interception detected',

      description:
        'The sifted key did not contain enough unexpected errors to indicate an eavesdropper.',

      danger: false,
    };
  }, [result]);

  function selectRole(
    selectedRole: Role,
  ) {
    setRole(selectedRole);

    if (selectedRole === 'eve') {
      setIncludeEve(true);
    }

    setStage(0);
    setResult(null);
    setError(null);
  }

  function updateAliceBit(
    index: number,
    bit: Bit,
  ) {
    setAliceChoices((current) =>
      current.map((choice, i) =>
        i === index
          ? {
              ...choice,
              bit,
            }
          : choice,
      ),
    );
  }

  function updateAliceBasis(
    index: number,
    basis: Basis,
  ) {
    setAliceChoices((current) =>
      current.map((choice, i) =>
        i === index
          ? {
              ...choice,
              basis,
            }
          : choice,
      ),
    );
  }

  function updateBobBasis(
    index: number,
    basis: Basis,
  ) {
    setBobChoices((current) =>
      current.map((choice, i) =>
        i === index
          ? basis
          : choice,
      ),
    );
  }

  function updateEveBasis(
    index: number,
    basis: Basis,
  ) {
    setEveChoices((current) =>
      current.map((choice, i) =>
        i === index
          ? basis
          : choice,
      ),
    );
  }

  function buildRequestBody() {
    if (!role) {
      return null;
    }

    const body: Record<
      string,
      unknown
    > = {
      num_qubits: N,
      eavesdrop: eveActive,
      user_role: role,
      trace_limit: N,
    };

    if (role === 'alice') {
      body.user_bits =
        aliceChoices.map(
          (choice) =>
            choice.bit as Bit,
        );

      body.user_bases =
        aliceChoices.map(
          (choice) =>
            BASIS_TO_CODE[
              choice.basis as Basis
            ],
        );
    }

    if (role === 'bob') {
      body.user_bases =
        bobChoices.map(
          (basis) =>
            BASIS_TO_CODE[
              basis as Basis
            ],
        );
    }

    if (role === 'eve') {
      body.user_bases =
        eveChoices.map(
          (basis) =>
            BASIS_TO_CODE[
              basis as Basis
            ],
        );
    }

    return body;
  }

  async function runSimulation() {
    const body =
      buildRequestBody();

    if (!body) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response =
        await fetch(
          '/api/simulator',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify(
              body,
            ),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ??
            'The BB84 simulator could not run.',
        );

        return false;
      }

      setResult(data);

      return true;
    } catch {
      setError(
        'Could not connect to the BB84 simulator.',
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

    /*
      Run the Qiskit simulation
      before entering Compare.
    */
    if (
      stage === 1 &&
      !result
    ) {
      if (!roleInputComplete) {
        return;
      }

      const successful =
        await runSimulation();

      if (!successful) {
        return;
      }
    }

    setStage((current) =>
      Math.min(
        current + 1,
        stages.length - 1,
      ),
    );
  }

  function previousStage() {
    setStage((current) =>
      Math.max(
        current - 1,
        0,
      ),
    );
  }

  function restart() {
    setStage(0);
    setResult(null);
    setError(null);

    setAliceChoices(
      emptyAliceChoices(),
    );

    setBobChoices(
      emptyBasisChoices(),
    );

    setEveChoices(
      emptyBasisChoices(),
    );
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
        setIncludeEve={
          setIncludeEve
        }
        onSelectRole={
          selectRole
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-default)]">
      <SimulatorProgress
        stage={stage}
        progress={progress}
      />

      <div className="grid min-h-[620px] lg:grid-cols-[330px_1fr]">
        <MissionPanel
          role={role}
          stage={stage}
          eveActive={eveActive}
          onChangeRole={
            changeRole
          }
        />

        <section className="flex min-w-0 flex-col p-6 lg:p-8">
          {stage === 0 && (
            <TransmitStage
              role={role}
              aliceChoices={
                aliceChoices
              }
              eveChoices={
                eveChoices
              }
              onAliceBit={
                updateAliceBit
              }
              onAliceBasis={
                updateAliceBasis
              }
              onEveBasis={
                updateEveBasis
              }
            />
          )}

          {stage === 1 && (
            <MeasureStage
              role={role}
              bobChoices={
                bobChoices
              }
              onBobBasis={
                updateBobBasis
              }
              inputComplete={
                roleInputComplete
              }
            />
          )}

          {stage === 2 &&
            result && (
              <CompareStage
                result={
                  result
                }
                eveActive={
                  eveActive
                }
              />
            )}

          {stage === 3 &&
            result && (
              <AnalyseStage
                result={
                  result
                }
                qberPercent={
                  qberPercent
                }
              />
            )}

          {stage === 4 &&
            result &&
            status && (
              <ResultsStage
                result={
                  result
                }
                qberPercent={
                  qberPercent
                }
                status={
                  status
                }
                onRestart={
                  restart
                }
              />
            )}

          {error && (
            <div className="mt-6 rounded-xl border border-[var(--error)] p-4 text-sm text-[var(--error)]">
              {error}
            </div>
          )}

          {stage <
            stages.length -
              1 && (
            <div className="mt-auto flex items-center justify-between border-t border-[var(--border-default)] pt-6">
              <button
                type="button"
                onClick={
                  previousStage
                }
                disabled={
                  stage === 0
                }
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowLeft
                  size={16}
                />

                Back
              </button>

              <button
                type="button"
                onClick={
                  nextStage
                }
                disabled={
                  isLoading ||
                  (stage === 1 &&
                    !roleInputComplete)
                }
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-simulator)] px-5 py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLoading
                  ? 'Running Qiskit...'
                  : 'Continue'}

                {!isLoading && (
                  <ArrowRight
                    size={
                      16
                    }
                  />
                )}
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

  setIncludeEve: (
    enabled: boolean,
  ) => void;

  onSelectRole: (
    role: Role,
  ) => void;
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
          You control one
          participant in the
          BB84 exchange. The
          remaining participants
          are controlled by the
          simulator.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {(
            Object.keys(
              roleInfo,
            ) as Role[]
          ).map((role) => {
            const info =
              roleInfo[role];

            return (
              <button
                key={
                  role
                }
                type="button"
                onClick={() =>
                  onSelectRole(
                    role,
                  )
                }
                className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5 text-left transition hover:border-[var(--accent-simulator)]"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--accent-simulator)] text-sm font-bold text-[var(--accent-simulator)]">
                  {
                    info
                      .name[0]
                  }
                </div>

                <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">
                  {
                    info.subtitle
                  }
                </p>

                <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                  Play as{' '}
                  {
                    info.name
                  }
                </h3>

                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {
                    info.description
                  }
                </p>
              </button>
            );
          })}
        </div>

        <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 transition hover:border-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={
              includeEve
            }
            onChange={(
              event,
            ) =>
              setIncludeEve(
                event.target
                  .checked,
              )
            }
            className="h-4 w-4 accent-[var(--accent-simulator)]"
          />

          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Include an
              eavesdropper
            </p>

            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Eve will
              intercept and
              resend photons
              during the
              exchange.
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
          {Math.round(
            progress,
          )}
          %
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[var(--border-default)]">
        <div
          className="h-full rounded-full bg-[var(--accent-simulator)] transition-all duration-300"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <div className="mt-4 hidden grid-cols-5 gap-2 md:grid">
        {stages.map(
          (
            label,
            index,
          ) => (
            <div
              key={
                label
              }
              className={
                index <= stage
                  ? 'text-xs font-medium text-[var(--text-primary)]'
                  : 'text-xs text-[var(--text-secondary)] opacity-50'
              }
            >
              {index +
                1}
              .{' '}
              {label}
            </div>
          ),
        )}
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

    'Inspect the error rate and determine whether the channel may have been disturbed.',

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
        {
          descriptions[
            stage
          ]
        }
      </p>

      <div className="mt-7 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
        <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">
          Your Role
        </p>

        <p className="mt-1 font-semibold text-[var(--text-primary)]">
          {
            roleInfo[
              role
            ].name
          }
        </p>

        <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
          {
            roleInfo[
              role
            ]
              .description
          }
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
              Photons may be
              intercepted
              before reaching
              Bob.
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={
          onChangeRole
        }
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

  aliceChoices:
    AliceChoice[];

  eveChoices: (
    | Basis
    | null
  )[];

  onAliceBit: (
    index: number,
    bit: Bit,
  ) => void;

  onAliceBasis: (
    index: number,
    basis: Basis,
  ) => void;

  onEveBasis: (
    index: number,
    basis: Basis,
  ) => void;
}) {
  if (role === 'alice') {
    return (
      <div>
        <StageHeading
          eyebrow="Transmitter Console — Agent Alice"
          title="Encode the photons"
          description="Choose one bit and one basis for every photon. Bob cannot see your choices while the photons are travelling."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {aliceChoices.map(
            (
              choice,
              index,
            ) => (
              <PhotonChoiceCard
                key={
                  index
                }
                index={
                  index
                }
                choice={
                  choice
                }
                onBit={(
                  bit,
                ) =>
                  onAliceBit(
                    index,
                    bit,
                  )
                }
                onBasis={(
                  basis,
                ) =>
                  onAliceBasis(
                    index,
                    basis,
                  )
                }
              />
            ),
          )}
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
          description="Choose the basis you will use to measure each photon before resending it to Bob."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {eveChoices.map(
            (
              basis,
              index,
            ) => (
              <BasisCard
                key={
                  index
                }
                index={
                  index
                }
                basis={
                  basis
                }
                title="Intercepted photon"
                onBasis={(
                  value,
                ) =>
                  onEveBasis(
                    index,
                    value,
                  )
                }
              />
            ),
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <StageHeading
        eyebrow="Quantum Channel"
        title="Alice is transmitting"
        description="Alice is preparing six photons using randomly generated bits and bases. Her choices remain hidden from you."
      />

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

  bobChoices: (
    | Basis
    | null
  )[];

  onBobBasis: (
    index: number,
    basis: Basis,
  ) => void;

  inputComplete: boolean;
}) {
  if (role === 'bob') {
    return (
      <div>
        <StageHeading
          eyebrow="Receiver Console — Agent Bob"
          title="Measure the photons"
          description="You do not know which bases Alice used. Choose either the rectilinear or diagonal basis for each photon."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {bobChoices.map(
            (
              basis,
              index,
            ) => (
              <BasisCard
                key={
                  index
                }
                index={
                  index
                }
                basis={
                  basis
                }
                title="Incoming photon"
                onBasis={(
                  value,
                ) =>
                  onBobBasis(
                    index,
                    value,
                  )
                }
              />
            ),
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <StageHeading
        eyebrow="Receiver Console — Agent Bob"
        title="Bob is measuring"
        description="Bob does not know Alice’s bases. The simulator will choose his measurement bases before the results are compared."
      />

      <HiddenPhotonRow />

      <div className="mt-8 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
        <p className="text-sm text-[var(--text-secondary)]">
          {inputComplete
            ? 'Your choices are complete. Continue to run the Qiskit simulation.'
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
        description="Alice and Bob publicly compare their bases. Positions using different bases are discarded."
      />

      <div className="mt-8 overflow-x-auto rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-5">
        <table className="w-full min-w-[700px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border-default)] text-left text-xs uppercase tracking-wider text-[var(--text-secondary)]">
              <th className="py-4">
                Packet
              </th>

              <th className="py-4">
                Alice bit
              </th>

              <th className="py-4">
                Alice basis
              </th>

              {eveActive && (
                <th className="py-4">
                  Eve basis
                </th>
              )}

              <th className="py-4">
                Bob basis
              </th>

              <th className="py-4">
                Bob result
              </th>

              <th className="py-4">
                Decision
              </th>
            </tr>
          </thead>

          <tbody>
            {result.trace.map(
              (
                row,
                index,
              ) => (
                <tr
                  key={
                    index
                  }
                  className="border-b border-[var(--border-default)] last:border-b-0"
                >
                  <td className="py-4 text-[var(--text-primary)]">
                    {index +
                      1}
                  </td>

                  <td className="text-[var(--text-primary)]">
                    {
                      row.alice_bit
                    }
                  </td>

                  <td>
                    <BasisBadge
                      basis={
                        row.alice_basis
                      }
                    />
                  </td>

                  {eveActive && (
                    <td>
                      {row.eve_basis ? (
                        <BasisBadge
                          basis={
                            row.eve_basis
                          }
                        />
                      ) : (
                        <span className="text-[var(--text-secondary)]">
                          —
                        </span>
                      )}
                    </td>
                  )}

                  <td>
                    <BasisBadge
                      basis={
                        row.bob_basis
                      }
                    />
                  </td>

                  <td className="text-[var(--text-primary)]">
                    {
                      row.bob_result
                    }
                  </td>

                  <td>
                    {row.kept ? (
                      <span className="inline-flex items-center gap-1.5 font-medium text-[var(--success)]">
                        <Check
                          size={
                            15
                          }
                        />

                        Keep
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <X
                          size={
                            15
                          }
                        />

                        Discard
                      </span>
                    )}
                  </td>
                </tr>
              ),
            )}
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
  qberPercent,
}: {
  result: Bb84ApiResponse;
  qberPercent: number;
}) {
  return (
    <div>
      <StageHeading
        eyebrow="Security Check"
        title="Analyse the quantum channel"
        description="Errors in the sifted key can reveal disturbance introduced while the photons were travelling."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Metric
          label="Sifted key"
          value={`${result.sifted_key_length} bits`}
        />

        <Metric
          label="Errors detected"
          value={String(
            result.errors,
          )}
        />

        <Metric
          label="QBER"
          value={`${qberPercent}%`}
        />
      </div>

      <div className="mt-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
        <div className="mb-3 flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">
            Quantum bit error rate
          </span>

          <span className="font-semibold text-[var(--text-primary)]">
            {qberPercent}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-[var(--border-default)]">
          <div
            className={
              result.eavesdropping_detected
                ? 'h-full rounded-full bg-[var(--error)] transition-all'
                : 'h-full rounded-full bg-[var(--accent-simulator)] transition-all'
            }
            style={{
              width: `${Math.min(
                qberPercent,
                100,
              )}%`,
            }}
          />
        </div>

        <p className="mt-4 text-xs leading-5 text-[var(--text-secondary)]">
          QBER measures the
          percentage of errors
          in the sampled key. A
          disturbance in the
          quantum channel can
          increase this value.
        </p>
      </div>
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
  onRestart,
}: {
  result: Bb84ApiResponse;

  qberPercent: number;

  status: {
    title: string;
    description: string;
    danger: boolean;
  };

  onRestart: () => void;
}) {
  return (
    <div>
      <StageHeading
        eyebrow="Mission Complete"
        title="Key exchange result"
        description="Review what happened during the BB84 exchange."
      />

      <div
        className={`mt-8 rounded-xl border p-6 ${
          status.danger
            ? 'border-[var(--error)]'
            : 'border-[var(--success)]'
        }`}
      >
        <div className="flex gap-4">
          {status.danger ? (
            <TriangleAlert
              className="shrink-0 text-[var(--error)]"
              size={26}
            />
          ) : (
            <ShieldCheck
              className="shrink-0 text-[var(--success)]"
              size={26}
            />
          )}

          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {
                status.title
              }
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              {
                status.description
              }
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Photons sent"
          value={String(
            result.num_qubits,
          )}
        />

        <Metric
          label="Bits kept"
          value={String(
            result.sifted_key_length,
          )}
        />

        <Metric
          label="Errors"
          value={String(
            result.errors,
          )}
        />

        <Metric
          label="QBER"
          value={`${qberPercent}%`}
        />
      </div>

      <div className="mt-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
        <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">
          Secure key
        </p>

        <p className="mt-2 break-all font-mono text-lg tracking-[0.15em] text-[var(--text-primary)]">
          {result.secure_key_preview ||
            'No secure key generated'}
        </p>

        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          Secure key length:{' '}
          {
            result.secure_key_length
          }{' '}
          bits
        </p>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        <RotateCcw
          size={16}
        />

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

function PhotonChoiceCard({
  index,
  choice,
  onBit,
  onBasis,
}: {
  index: number;

  choice: AliceChoice;

  onBit: (
    bit: Bit,
  ) => void;

  onBasis: (
    basis: Basis,
  ) => void;
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
        {(
          [0, 1] as Bit[]
        ).map((bit) => (
          <ChoiceButton
            key={bit}
            selected={
              choice.bit ===
              bit
            }
            onClick={() =>
              onBit(bit)
            }
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
          selected={
            choice.basis ===
            'rect'
          }
          onClick={() =>
            onBasis(
              'rect',
            )
          }
        >
          + Straight
        </ChoiceButton>

        <ChoiceButton
          selected={
            choice.basis ===
            'diag'
          }
          onClick={() =>
            onBasis(
              'diag',
            )
          }
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

  basis:
    | Basis
    | null;

  title: string;

  onBasis: (
    basis: Basis,
  ) => void;
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
          selected={
            basis === 'rect'
          }
          onClick={() =>
            onBasis(
              'rect',
            )
          }
        >
          + Straight
        </ChoiceButton>

        <ChoiceButton
          selected={
            basis === 'diag'
          }
          onClick={() =>
            onBasis(
              'diag',
            )
          }
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

  children:
    React.ReactNode;
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
      {Array.from(
        {
          length: N,
        },
        (_, index) => (
          <div
            key={
              index
            }
            className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-card)]"
          >
            <div className="text-center">
              <div className="mx-auto h-3 w-3 rounded-full bg-[var(--text-secondary)]" />

              <p className="mt-2 text-[10px] text-[var(--text-secondary)]">
                {index +
                  1}
              </p>
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function BasisBadge({
  basis,
}: {
  basis: string;
}) {
  const straight =
    basis === '+';

  return (
    <span className="inline-flex min-w-20 items-center justify-center rounded-md border border-[var(--border-default)] px-2 py-1 text-xs text-[var(--text-secondary)]">
      {straight
        ? '+ Straight'
        : '× Diagonal'}
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