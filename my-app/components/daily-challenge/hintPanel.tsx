'use client';

// hints are revealed one at a time throw server
// hint text is LLM written with fallbacks at failure
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
  // true once solved or out of attempts
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
    <div className="rounded-xl border border-border bg-surface-raised p-5">
      <div className="flex items-center gap-3">
        <Lightbulb size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-text-primary">Hints</h2>
        <span className="ml-auto text-xs text-text-secondary">
          {hints.length} of {hintsTotal} used
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-text-secondary">
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
                text ? 'border-accent/30 bg-accent/10' : 'border-border bg-surface',
              ].join(' ')}
            >
              <p className={['text-xs font-semibold', text ? 'text-accent' : 'text-text-secondary'].join(' ')}>
                Hint {i + 1}
              </p>
              {text ? (
                <p className="mt-1 text-sm leading-6 text-text-secondary">{text}</p>
              ) : (
                <p className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
                  <Lock size={12} aria-hidden="true" /> Hidden
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {error && (
        <p role="alert" className="mt-4 text-xs leading-5 text-danger">
          {error}
        </p>
      )}

      {!locked && next < hintsTotal && (
        <button
          type="button"
          onClick={reveal}
          disabled={busy}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border-strong px-4 py-2.5 text-sm font-medium text-text-secondary transition hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? <Spinner size={16} /> : <Lightbulb size={15} aria-hidden="true" />}
          {busy ? 'Revealing...' : `Reveal hint ${next + 1} (−${HINT_XP_PENALTY} XP)`}
        </button>
      )}
    </div>
  );
}
