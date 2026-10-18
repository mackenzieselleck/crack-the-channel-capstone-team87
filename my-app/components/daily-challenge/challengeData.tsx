'use client';

// The data panel for each challenge category: tables, states, matrices and circuits.
// Everything shown here comes from prompt_data, written by the Python generators.
import { ChevronDown } from 'lucide-react';
import type { PublicChallenge } from '@/lib/daily-challenge/types';
import { CircuitDiagram } from './circuitDiagram';
import { MathText, Tex } from './mathText';

type Data = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));

export function ChallengeData({ challenge }: { challenge: PublicChallenge }) {
  const d = challenge.prompt_data as Data;
  const task = str(d.task);

  switch (task) {
    case 'compute_qber_and_decide':
      return (
        <Stack>
          <Tiles items={[{ label: 'Abort threshold', value: `${d.threshold_pct}%` }]} />
          <SiftedTable rows={(d.sifted_rows as SiftedRow[]) ?? []} />
        </Stack>
      );
    case 'estimate_intercept_rate':
      return (
        <Tiles
          items={[
            { label: 'Measured QBER', value: `${d.qber_pct}%` },
            { label: 'Sifted bits compared', value: str(d.sifted_bits) },
          ]}
        />
      );
    case 'choose_intercept_rate':
      return (
        <Tiles items={[{ label: 'Alice and Bob abort above', value: `${d.threshold_pct}% QBER` }]} />
      );
    case 'sift_key':
    case 'sift_then_decrypt_bits':
    case 'crack_the_word':
      return (
        <Stack>
          {d.ciphertext != null && (
            <Tiles
              items={[{ label: 'Ciphertext', value: groupBits(str(d.ciphertext), task === 'crack_the_word' ? 5 : 0), mono: true }]}
            />
          )}
          <RoundsTable rows={(d.rounds as RoundRow[]) ?? []} />
          {task === 'crack_the_word' && <LetterTable encoding={str(d.encoding)} />}
        </Stack>
      );
    case 'apply_gates':
      return <StateEvolution d={d} />;
    case 'measurement_probability':
      return (
        <Stack>
          <Panel label="State">
            <Tex tex={str(d.state)} display />
          </Panel>
          <Tiles items={[{ label: 'Measurement outcome', value: `|${str(d.outcome)}⟩`, mono: true }]} />
        </Stack>
      );
    case 'find_normalisation_constant':
      return (
        <Panel label="State (find N)">
          <Tex tex={str(d.state)} display />
        </Panel>
      );
    case 'which_single_gate':
      return (
        <Panel label="Gate product">
          <div className="py-2 text-center text-3xl font-semibold tracking-wide text-[#E7ECF5]">
            <Tex tex={`${str(d.expression)} = \\;?`} />
          </div>
          <p className="text-center text-xs text-[#8B95AC]">
            Gates are applied right to left, like matrix multiplication.
          </p>
        </Panel>
      );
    case 'simplify_circuit':
      return (
        <Panel label={`Original circuit · ${d.original_gate_count} gates`}>
          <CircuitDiagram
            tokens={(d.circuit as string[]) ?? []}
            numQubits={Number(d.num_qubits) || 1}
            label="Original circuit"
          />
        </Panel>
      );
    case 'module_question':
      return (
        <Panel label="Question">
          <p className="text-base leading-7 text-[#E7ECF5]">{str(d.question)}</p>
        </Panel>
      );
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

function Stack({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#233049] bg-[#0D1728] p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#8B95AC]">{label}</p>
      <div className="overflow-x-auto text-[#E7ECF5]">{children}</div>
    </div>
  );
}

function Tiles({ items }: { items: { label: string; value: string; mono?: boolean }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((t) => (
        <div key={t.label} className="rounded-lg border border-[#233049] bg-[#0D1728] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.15em] text-[#8B95AC]">{t.label}</p>
          <p className={['mt-1 text-lg font-semibold text-[#E7ECF5]', t.mono ? 'break-all font-mono tracking-wider' : ''].join(' ')}>
            {t.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function groupBits(bits: string, size: number) {
  if (!size) return bits;
  return bits.match(new RegExp(`.{1,${size}}`, 'g'))?.join(' ') ?? bits;
}

const th = 'sticky top-0 bg-[#111B2E] px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#8B95AC]';
const td = 'px-4 py-2 font-mono text-sm text-[#C5CDD9]';

type SiftedRow = { round: number; alice_bit: number; bob_bit: number };
function SiftedTable({ rows }: { rows: SiftedRow[] }) {
  return (
    <ScrollTable caption={`Sifted bits compared by Alice and Bob (${rows.length} rows)`}>
      <thead>
        <tr>
          <th scope="col" className={th}>Round</th>
          <th scope="col" className={th}>Alice&apos;s bit</th>
          <th scope="col" className={th}>Bob&apos;s bit</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.round} className="border-t border-[#1A263A]">
            <td className={`${td} text-[#8B95AC]`}>{r.round}</td>
            <td className={td}>{r.alice_bit}</td>
            <td className={td}>{r.bob_bit}</td>
          </tr>
        ))}
      </tbody>
    </ScrollTable>
  );
}

type RoundRow = { round: number; alice_bit: number; alice_basis: string; bob_basis: string };
function RoundsTable({ rows }: { rows: RoundRow[] }) {
  return (
    <div className="space-y-2">
      <ScrollTable caption={`Transmission log (${rows.length} rounds)`}>
        <thead>
          <tr>
            <th scope="col" className={th}>Round</th>
            <th scope="col" className={th}>Alice&apos;s bit</th>
            <th scope="col" className={th}>Alice&apos;s basis</th>
            <th scope="col" className={th}>Bob&apos;s basis</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.round} className="border-t border-[#1A263A]">
              <td className={`${td} text-[#8B95AC]`}>{r.round}</td>
              <td className={td}>{r.alice_bit}</td>
              <td className={td}>{r.alice_basis}</td>
              <td className={td}>{r.bob_basis}</td>
            </tr>
          ))}
        </tbody>
      </ScrollTable>
      <p className="text-xs leading-5 text-[#8B95AC]">
        Z is the standard (computational) basis and X is the diagonal (Hadamard) basis.
      </p>
    </div>
  );
}

function ScrollTable({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <div className="max-h-96 overflow-auto rounded-lg border border-[#233049] bg-[#0D1728]">
      <table className="w-full border-collapse">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function LetterTable({ encoding }: { encoding: string }) {
  return (
    <details className="group rounded-lg border border-[#233049] bg-[#0D1728]">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 text-sm font-medium text-[#C5CDD9]">
        <span>Letter encoding: {encoding}</span>
        <ChevronDown size={16} className="text-[#8B95AC] transition group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 border-t border-[#233049] px-5 py-4 sm:grid-cols-4">
        {ALPHABET.split('').map((letter, i) => (
          <p key={letter} className="font-mono text-xs text-[#AAB4C5]">
            <span className="inline-block w-4 font-semibold text-[#E7ECF5]">{letter}</span>{' '}
            {i.toString(2).padStart(5, '0')}
          </p>
        ))}
      </div>
    </details>
  );
}

function StateEvolution({ d }: { d: Data }) {
  const gates = (d.gates as string[]) ?? [];
  return (
    <Stack>
      <div className="grid gap-3 sm:grid-cols-2">
        <Panel label="Start state">
          <Tex tex={str(d.start_state)} display />
        </Panel>
        <Panel label={gates.length > 1 ? 'Gates, applied in order' : 'Gate'}>
          <ol className="flex flex-wrap items-center gap-2">
            {gates.map((g, i) => (
              <li key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-[#69758A]">then</span>}
                <span className="rounded-md border border-[#4C8DFF]/40 bg-[#0F62FE]/10 px-3 py-1.5 text-sm font-semibold text-[#E7ECF5]">
                  {g}
                </span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
      {d.reference_matrix != null && (
        <Panel label="Matrix for this gate">
          <Tex tex={str(d.reference_matrix)} display />
        </Panel>
      )}
      {d.convention != null && (
        <p className="text-xs leading-5 text-[#8B95AC]">
          Notation: <MathText text={str(d.convention)} />
        </p>
      )}
    </Stack>
  );
}
