'use client';

// One input component per input_kind. Each produces exactly the submission shape the
// submit route's Zod union accepts. Inputs are controlled: `value` is the current
// submission (or null when incomplete) and `onChange` reports the new one.
import { Delete, RotateCcw, ShieldAlert, ShieldCheck, Undo2 } from 'lucide-react';
import { useId, useState } from 'react';
import type { PublicChallenge, Submission } from '@/lib/daily-challenge/types';
import { CircuitDiagram, describeToken, gateLabel } from './circuitDiagram';
import { MathText } from './mathText';

type Props = {
  challenge: PublicChallenge;
  value: Submission | null;
  onChange: (s: Submission | null) => void;
  disabled?: boolean;
};

export function AnswerInput(props: Props) {
  const { challenge } = props;
  switch (challenge.input_kind) {
    case 'multiple_choice': return <MultipleChoice {...props} />;
    case 'bits':            return <BitsInput {...props} />;
    case 'text':            return challenge.type === 'sifting' ? <WordInput {...props} /> : <MathInput {...props} />;
    case 'amplitudes':      return <AmplitudesInput {...props} />;
    case 'circuit':         return <CircuitBuilder {...props} />;
    case 'decision':        return <DecisionInput {...props} />;
    case 'number':          return <RateInput {...props} />;
    default:                return <p className="text-sm text-[#FCA5A5]">This challenge type isn&apos;t supported yet.</p>;
  }
}

/** True when the submission is complete enough to send. */
export function isComplete(s: Submission | null): s is Submission {
  if (!s) return false;
  if ('option_id' in s) return !!s.option_id;
  if ('bits' in s) return /^[01]{1,64}$/.test(s.bits);
  if ('text' in s) return s.text.trim().length > 0;
  if ('amplitudes' in s) return s.amplitudes.length === 4 && s.amplitudes.every((a) => a.trim().length > 0);
  if ('circuit' in s) return true;                 // an empty circuit is a valid answer (identity)
  if ('abort' in s) return typeof s.abort === 'boolean';
  if ('rate_pct' in s) return Number.isFinite(s.rate_pct);
  return false;
}

const inputBase =
  'w-full rounded-md border border-[#34425A] bg-[#0D1728] px-4 py-3 text-[#E7ECF5] placeholder:text-[#69758A] outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/30 disabled:opacity-50';
const chip =
  'rounded-md border border-[#34425A] px-3 py-1.5 text-sm font-medium text-[#C5CDD9] transition hover:border-[#8B95AC] hover:text-white disabled:cursor-not-allowed disabled:opacity-40';

function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8B95AC]">
      {children}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Multiple choice (bb84_eve t2, state_evolution t1-2, normalisation t1, gate t1, module_mcq)
// ---------------------------------------------------------------------------
function MultipleChoice({ challenge, value, onChange, disabled }: Props) {
  const selected = value && 'option_id' in value ? value.option_id : null;
  const name = useId();
  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="sr-only">Choose one answer</legend>
      {challenge.options.map((opt, i) => {
        const checked = selected === opt.id;
        return (
          <label
            key={opt.id}
            className={[
              'flex cursor-pointer items-center gap-4 rounded-lg border px-5 py-4 transition',
              checked
                ? 'border-[#0F62FE] bg-[#0F62FE]/10'
                : 'border-[#233049] bg-[#0D1728] hover:border-[#34425A]',
            ].join(' ')}
          >
            <input
              type="radio"
              name={name}
              value={opt.id}
              checked={checked}
              onChange={() => onChange({ option_id: opt.id })}
              className="sr-only"
            />
            <span
              className={[
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                checked ? 'border-[#0F62FE] bg-[#0F62FE] text-white' : 'border-[#34425A] text-[#8B95AC]',
              ].join(' ')}
              aria-hidden="true"
            >
              {String.fromCharCode(65 + i)}
            </span>
            <MathText text={opt.display} large className="min-w-0 overflow-x-auto py-1 text-base text-[#E7ECF5]" />
          </label>
        );
      })}
    </fieldset>
  );
}

// ---------------------------------------------------------------------------
// Bit string (sifting t1-2)
// ---------------------------------------------------------------------------
function BitsInput({ value, onChange, disabled }: Props) {
  const bits = value && 'bits' in value ? value.bits : '';
  const id = useId();
  const set = (b: string) => onChange(b ? { bits: b.slice(0, 64) } : null);
  return (
    <div>
      <Label htmlFor={id}>Your bits</Label>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        value={bits}
        disabled={disabled}
        onChange={(e) => set(e.target.value.replace(/[^01]/g, ''))}
        placeholder="e.g. 0110"
        className={`${inputBase} font-mono text-lg tracking-[0.3em]`}
        aria-describedby={`${id}-count`}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className={chip} disabled={disabled} onClick={() => set(bits + '0')}>0</button>
        <button type="button" className={chip} disabled={disabled} onClick={() => set(bits + '1')}>1</button>
        <button type="button" className={`${chip} inline-flex items-center gap-1.5`} disabled={disabled || !bits} onClick={() => set(bits.slice(0, -1))}>
          <Delete size={14} aria-hidden="true" /> Delete
        </button>
        <span id={`${id}-count`} className="ml-auto text-xs text-[#8B95AC]">
          {bits.length} bit{bits.length === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Three-letter word (sifting t3)
// ---------------------------------------------------------------------------
function WordInput({ value, onChange, disabled }: Props) {
  const text = value && 'text' in value ? value.text : '';
  const id = useId();
  return (
    <div>
      <Label htmlFor={id}>Decoded word</Label>
      <input
        id={id}
        autoComplete="off"
        spellCheck={false}
        value={text}
        disabled={disabled}
        maxLength={3}
        onChange={(e) => {
          const t = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
          onChange(t ? { text: t } : null);
        }}
        placeholder="ABC"
        className={`${inputBase} max-w-48 font-mono text-2xl uppercase tracking-[0.5em]`}
      />
      <p className="mt-2 text-xs text-[#8B95AC]">Three letters, A to Z.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Typed maths (normalisation t2-3)
// ---------------------------------------------------------------------------
function MathInput({ challenge, value, onChange, disabled }: Props) {
  const text = value && 'text' in value ? value.text : '';
  const id = useId();
  const hint = String((challenge.prompt_data as Record<string, unknown>).input_hint ?? 'e.g. 1/sqrt(3)');
  const set = (t: string) => onChange(t ? { text: t.slice(0, 40) } : null);
  return (
    <div>
      <Label htmlFor={id}>N =</Label>
      <input
        id={id}
        autoComplete="off"
        spellCheck={false}
        value={text}
        disabled={disabled}
        maxLength={40}
        onChange={(e) => set(e.target.value)}
        placeholder={hint}
        className={`${inputBase} font-mono text-lg`}
        aria-describedby={`${id}-help`}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {['sqrt(', ')', '/', 'i'].map((t) => (
          <button key={t} type="button" className={`${chip} font-mono`} disabled={disabled} onClick={() => set(text + t)}>
            {t === 'sqrt(' ? '√ sqrt(' : t}
          </button>
        ))}
      </div>
      <p id={`${id}-help`} className="mt-3 text-xs leading-5 text-[#8B95AC]">
        Type square roots as sqrt(…), for example 1/sqrt(2). Any equivalent exact form is accepted, so 1/sqrt(2) and
        sqrt(2)/2 both count.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Amplitudes (state_evolution t3)
// ---------------------------------------------------------------------------
const AMP_CHIPS = [
  { insert: '0', label: '0' },
  { insert: '1', label: '1' },
  { insert: '-1', label: '−1' },
  { insert: '1/sqrt(2)', label: '1/√2' },
  { insert: '-1/sqrt(2)', label: '−1/√2' },
  { insert: '1/2', label: '1/2' },
  { insert: '-1/2', label: '−1/2' },
];

function AmplitudesInput({ challenge, value, onChange, disabled }: Props) {
  const basis = ((challenge.prompt_data as Record<string, unknown>).basis_order as string[]) ?? ['00', '01', '10', '11'];
  const amps = value && 'amplitudes' in value ? value.amplitudes : basis.map(() => '');
  const [active, setActive] = useState(0);
  const base = useId();
  const set = (i: number, v: string) => {
    const next = amps.map((a, j) => (j === i ? v.slice(0, 40) : a));
    onChange({ amplitudes: next });
  };
  return (
    <div>
      <p className="mb-3 text-sm leading-6 text-[#AAB4C5]">
        Enter the amplitude for each basis state. Use 0 for states that don&apos;t appear.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {basis.map((b, i) => (
          <div key={b}>
            <label htmlFor={`${base}-${i}`} className="mb-1.5 block font-mono text-sm text-[#C5CDD9]">
              |{b}⟩
            </label>
            <input
              id={`${base}-${i}`}
              autoComplete="off"
              spellCheck={false}
              value={amps[i] ?? ''}
              disabled={disabled}
              onFocus={() => setActive(i)}
              onChange={(e) => set(i, e.target.value)}
              placeholder="e.g. 1/sqrt(2)"
              className={`${inputBase} font-mono ${active === i ? 'border-[#4C8DFF]/60' : ''}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <p className="mb-2 text-xs text-[#8B95AC]">
          Quick fill <span className="font-mono text-[#C5CDD9]">|{basis[active]}⟩</span>:
        </p>
        <div className="flex flex-wrap gap-2">
          {AMP_CHIPS.map((c) => (
            <button
              key={c.label}
              type="button"
              className={`${chip} font-mono`}
              disabled={disabled}
              onClick={() => {
                set(active, c.insert);
                setActive((active + 1) % basis.length);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Circuit builder (gate_simplification t2-3)
// ---------------------------------------------------------------------------
function CircuitBuilder({ challenge, value, onChange, disabled }: Props) {
  const d = challenge.prompt_data as Record<string, unknown>;
  const palette = (d.palette as string[]) ?? [];
  const numQubits = Number(d.num_qubits) || 1;
  const original = Number(d.original_gate_count) || 0;
  const circuit = value && 'circuit' in value ? value.circuit : [];
  const set = (c: string[]) => onChange({ circuit: c.slice(0, 20) });

  // Group the palette by qubit so the buttons read "q0: H X Z S".
  const groups = Array.from({ length: numQubits }, (_, q) =>
    palette.filter((t) => !t.startsWith('cx') && t.endsWith(` ${q}`)),
  );
  const twoQubit = palette.filter((t) => t.startsWith('cx'));

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B95AC]">Your circuit</p>
          <p className="text-xs text-[#8B95AC]">
            {circuit.length} gate{circuit.length === 1 ? '' : 's'} · original {original}
          </p>
        </div>
        <CircuitDiagram
          tokens={circuit}
          numQubits={numQubits}
          label="Your circuit"
          onRemove={disabled ? undefined : (i) => set(circuit.filter((_, j) => j !== i))}
        />
        <p className="mt-2 text-xs text-[#69758A]">Select a gate in your circuit to remove it.</p>
      </div>

      <div className="space-y-3 rounded-lg border border-[#233049] bg-[#0D1728] p-4">
        {groups.map((tokens, q) => (
          <div key={q} className="flex flex-wrap items-center gap-2">
            <span className="w-8 font-mono text-xs text-[#8B95AC]">q{q}</span>
            {tokens.map((t) => (
              <button
                key={t}
                type="button"
                disabled={disabled || circuit.length >= 20}
                onClick={() => set([...circuit, t])}
                aria-label={`Add ${describeToken(t)}`}
                className="h-10 min-w-10 rounded-md border border-[#4C8DFF]/50 bg-[#14284A] px-2 text-sm font-semibold text-[#E7ECF5] transition hover:border-[#4C8DFF] hover:bg-[#0F62FE]/25 disabled:opacity-40"
              >
                {gateLabel(t)}
              </button>
            ))}
          </div>
        ))}
        {twoQubit.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-[#233049] pt-3">
            <span className="w-8 font-mono text-xs text-[#8B95AC]">2q</span>
            {twoQubit.map((t) => (
              <button
                key={t}
                type="button"
                disabled={disabled || circuit.length >= 20}
                onClick={() => set([...circuit, t])}
                className="h-10 rounded-md border border-[#4C8DFF]/50 bg-[#14284A] px-3 text-sm font-semibold text-[#E7ECF5] transition hover:border-[#4C8DFF] hover:bg-[#0F62FE]/25 disabled:opacity-40"
              >
                {describeToken(t)}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2 border-t border-[#233049] pt-3">
          <button type="button" className={`${chip} inline-flex items-center gap-1.5`} disabled={disabled || !circuit.length} onClick={() => set(circuit.slice(0, -1))}>
            <Undo2 size={14} aria-hidden="true" /> Undo
          </button>
          <button type="button" className={`${chip} inline-flex items-center gap-1.5`} disabled={disabled || !circuit.length} onClick={() => set([])}>
            <RotateCcw size={14} aria-hidden="true" /> Clear
          </button>
        </div>
      </div>
      <p className="text-xs leading-5 text-[#8B95AC]">
        Build the shortest circuit that does the same job. If everything cancels, submit an empty circuit.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Abort decision (bb84_eve t1)
// ---------------------------------------------------------------------------
function DecisionInput({ value, onChange, disabled }: Props) {
  const v = value && 'abort' in value ? value : null;
  const [qber, setQber] = useState(v?.qber_pct != null ? String(v.qber_pct) : '');
  const id = useId();
  const emit = (abort: boolean | undefined, q: string) => {
    if (abort === undefined) return;
    const n = Number(q);
    onChange(q.trim() !== '' && Number.isFinite(n) ? { abort, qber_pct: Math.min(100, Math.max(0, n)) } : { abort });
  };
  const choices = [
    { abort: false, title: 'Keep the key', body: 'The error rate is at or below the threshold.', Icon: ShieldCheck },
    { abort: true, title: 'Abort', body: 'The error rate is too high. Eve may be listening.', Icon: ShieldAlert },
  ];
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor={id}>Your QBER (optional)</Label>
        <div className="flex max-w-56 items-center gap-2">
          <input
            id={id}
            inputMode="decimal"
            value={qber}
            disabled={disabled}
            onChange={(e) => {
              const q = e.target.value.replace(/[^0-9.]/g, '');
              setQber(q);
              emit(v?.abort, q);
            }}
            placeholder="e.g. 12.5"
            className={`${inputBase} font-mono`}
          />
          <span className="text-[#8B95AC]">%</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-[#8B95AC]">
          Optional. If you enter it, it must be within 1 percentage point of the true QBER for the answer to count.
        </p>
      </div>
      <fieldset disabled={disabled}>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8B95AC]">Decision</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {choices.map(({ abort, title, body, Icon }) => {
            const checked = v?.abort === abort;
            return (
              <label
                key={title}
                className={[
                  'flex cursor-pointer gap-4 rounded-lg border p-5 transition',
                  checked ? 'border-[#0F62FE] bg-[#0F62FE]/10' : 'border-[#233049] bg-[#0D1728] hover:border-[#34425A]',
                ].join(' ')}
              >
                <input type="radio" name={`${id}-decision`} className="sr-only" checked={checked} onChange={() => emit(abort, qber)} />
                <Icon size={22} className={checked ? 'text-[#4C8DFF]' : 'text-[#8B95AC]'} aria-hidden="true" />
                <span>
                  <span className="block font-semibold text-[#E7ECF5]">{title}</span>
                  <span className="mt-1 block text-sm leading-6 text-[#8B95AC]">{body}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Intercept rate (bb84_eve t3, play as Eve)
// ---------------------------------------------------------------------------
function RateInput({ value, onChange, disabled }: Props) {
  const rate = value && 'rate_pct' in value ? value.rate_pct : null;
  const id = useId();
  const set = (n: number) => onChange({ rate_pct: Math.min(100, Math.max(0, Math.round(n))) });
  return (
    <div>
      <Label htmlFor={id}>Your intercept rate</Label>
      <div className="flex items-center gap-4">
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          step={1}
          value={rate ?? 0}
          disabled={disabled}
          onChange={(e) => set(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#1A263A] accent-[#0F62FE] disabled:opacity-50 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#0F62FE] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0F62FE]"
          aria-valuetext={`${rate ?? 0}% of qubits intercepted`}
        />
        <div className="flex items-center gap-1">
          <input
            inputMode="numeric"
            aria-label="Intercept rate in percent"
            value={rate ?? ''}
            disabled={disabled}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, '');
              if (raw === '') onChange(null);
              else set(Number(raw));
            }}
            placeholder="0"
            className={`${inputBase} w-20 px-3 text-center font-mono`}
          />
          <span className="text-[#8B95AC]">%</span>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#8B95AC]">
        {rate == null
          ? 'Drag the slider or type a value.'
          : `Eve intercepts and measures ${rate}% of the qubits Alice sends.`}
      </p>
    </div>
  );
}
