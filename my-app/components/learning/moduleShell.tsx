'use client';

import { useModule } from '@/lib/learning/useModule';
import { Quiz } from './quiz';

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="h-3 w-full overflow-hidden rounded-full bg-slate-200"
    >
      <div
        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

/** Usage: <ModuleShell slug="what-is-qkd" /> inside e.g. app/learn/[slug]/page.tsx */
export function ModuleShell({ slug }: { slug: string }) {
  const { mod, pos, percent, quizResult, loading, busy, error, next, back, submitQuiz, retryQuiz } =
    useModule(slug);

  if (loading) return <p className="p-6">Loading…</p>;
  if (!mod) return <p className="p-6 text-red-700">{error ?? 'Module not found.'}</p>;

  const isLastReading = pos.kind === 'reading' && pos.index === mod.pages.length - 1;
  const page = pos.kind === 'reading' ? mod.pages[pos.index] : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{mod.title}</h1>
        <ProgressBar percent={percent} />
        <p className="text-sm text-slate-500">
          {percent}% complete ·{' '}
          {pos.kind === 'reading'
            ? `Part ${pos.index + 1} of ${mod.pages.length}`
            : 'Final test'}
        </p>
      </header>

      {error && <p className="rounded bg-red-50 p-3 text-red-800">{error}</p>}

      {/* Reading segment. Swap the <div> for your markdown renderer once content exists. */}
      {page && (
        <article className="space-y-3">
          <h2 className="text-xl font-semibold">{page.title}</h2>
          <div className="whitespace-pre-wrap">{page.body}</div>
        </article>
      )}

      {pos.kind === 'quiz' && (
        <Quiz
          questions={mod.questions}
          passMark={mod.passMark}
          result={quizResult}
          busy={busy}
          onSubmit={submitQuiz}
          onRetry={retryQuiz}
        />
      )}

      <nav className="flex justify-between">
        <button
          onClick={back}
          disabled={pos.kind === 'reading' && pos.index === 0}
          className="rounded-md border px-4 py-2 disabled:opacity-40"
        >
          Back
        </button>

        {pos.kind === 'reading' && (
          <button
            onClick={next}
            disabled={busy}
            className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-40"
          >
            {isLastReading ? 'Take the test' : 'Next'}
          </button>
        )}
      </nav>
    </div>
  );
}