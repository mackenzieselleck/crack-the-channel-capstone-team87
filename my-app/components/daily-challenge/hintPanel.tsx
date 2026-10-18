'use client';

// Hints are revealed one at a time through the server, which records each reveal so the
// XP penalty can't be skipped. Hint text is LLM-written (leak-checked), so it's plain text.
import { Lightbulb, Lock } from 'lucide-react';
import { useState } from 'react';
import { ApiFailure, dailyApi } from '@/lib/daily-challenge/client';
import { HINT_XP_PENALTY } from '@/lib/daily-challenge/types';
import { Spinner } from './loading';

export function HintPanel({
  challengeId,
  hints,
  hintsTotal,
  locked,
  onHints,
}: {
  challengeId: string;
  hints: string[];
  hintsTotal: number;
  /** True once solved or out of attempts: reveals no longer cost XP, but we stop offering them. */
  locked: boolean;
  onHints: (hints: string[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next = hints.length;

  async function reveal() {
    setBusy(true);
    setError(null);
    try {
      const res = await dailyApi.hint(challengeId, next);
      onHints(res.hints);
    } catch (e) {
      setError(e instanceof ApiFailure ? e.message : 'Could not load the hint. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#233049] bg-[#111B2E] p-5">
      <div className="flex items-center gap-3">
        <Lightbulb size={18} className="text-[#4C8DFF]" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-[#E7ECF5]">Hints</h2>
        <span className="ml-auto text-xs text-[#8B95AC]">
          {hints.length} of {hintsTotal} used
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-[#8B95AC]">
        Each hint gets more specific and costs {HINT_XP_PENALTY} XP if you solve the challenge.
      </p>

      <ol className="mt-5 space-y-3" aria-live="polite">
        {Array.from({ length: hintsTotal }, (_, i) => {
          const text = hints[i];
          return (
            <li
              key={i}
              className={[
                'rounded-lg border px-4 py-3',
                text ? 'border-[#4C8DFF]/30 bg-[#0F62FE]/10' : 'border-[#233049] bg-[#0D1728]',
              ].join(' ')}
            >
              <p className={['text-xs font-semibold', text ? 'text-[#4C8DFF]' : 'text-[#69758A]'].join(' ')}>
                Hint {i + 1}
              </p>
              {text ? (
                <p className="mt-1 text-sm leading-6 text-[#C5CDD9]">{text}</p>
              ) : (
                <p className="mt-1 flex items-center gap-2 text-xs text-[#69758A]">
                  <Lock size={12} aria-hidden="true" /> Hidden
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {error && (
        <p role="alert" className="mt-4 text-xs leading-5 text-[#FCA5A5]">
          {error}
        </p>
      )}

      {!locked && next < hintsTotal && (
        <button
          type="button"
          onClick={reveal}
          disabled={busy}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#34425A] px-4 py-2.5 text-sm font-medium text-[#C5CDD9] transition hover:border-[#8B95AC] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? <Spinner size={16} /> : <Lightbulb size={15} aria-hidden="true" />}
          {busy ? 'Revealing...' : `Reveal hint ${next + 1} (−${HINT_XP_PENALTY} XP)`}
        </button>
      )}
    </div>
  );
}
