'use client';

import {
  Award,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Lock,
} from 'lucide-react';

import { useModule } from '@/lib/learning/useModule';
import { Quiz } from './quiz';

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
          Module progress
        </span>

        <span className="text-sm font-semibold text-text-primary">
          {percent}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Module progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 overflow-hidden rounded-full bg-border"
      >
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function ModuleShell({ slug }: { slug: string }) {
  const {
    mod,
    progress,
    pos,
    percent,
    quizResult,
    loading,
    busy,
    error,
    next,
    back,
    submitQuiz,
    retryQuiz,
  } = useModule(slug);

  if (loading) {
    return (
      <main className="min-h-screen bg-surface px-6 py-14 text-text-primary">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-3 w-32 rounded bg-border" />
          <div className="h-10 w-2/3 rounded bg-border" />
          <div className="h-3 w-full rounded bg-border" />

          <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
            <div className="h-96 rounded-xl bg-surface-raised" />
            <div className="h-96 rounded-xl bg-surface-raised" />
          </div>
        </div>
      </main>
    );
  }

  if (!mod) {
    return (
      <main className="min-h-screen bg-surface px-6 py-16 text-text-primary">
        <div className="mx-auto max-w-3xl rounded-xl border border-danger/30 bg-danger/10 p-6">
          <p className="font-semibold text-danger">
            Unable to load this module
          </p>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {error ?? 'This learning module could not be found.'}
          </p>
        </div>
      </main>
    );
  }

  const isReading = pos.kind === 'reading';
  const page = isReading ? mod.pages[pos.index] : null;

  const isLastReading =
    isReading && pos.index === mod.pages.length - 1;

  return (
    <main className="min-h-screen bg-surface px-6 pb-24 pt-10 text-text-primary">
      <div className="mx-auto max-w-6xl">
        {/* Module orientation */}
        <header className="border-b border-border pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            Learning module
          </p>

          <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {mod.title}
              </h1>

              {mod.summary && (
                <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">
                  {mod.summary}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-surface-raised px-4 py-3">
              <p className="text-xs uppercase tracking-[0.15em] text-text-secondary">
                Assessment
              </p>

              <p className="mt-1 text-sm font-semibold text-text-primary">
                {mod.passMark}% to pass
              </p>
            </div>
          </div>

          <div className="mt-8">
            <ProgressBar percent={percent} />
          </div>
        </header>

        <div className="grid gap-8 py-8 lg:grid-cols-[270px_minmax(0,1fr)]">
          {/* Module pathway */}
          <aside>
            <div className="rounded-xl border border-border bg-surface-raised p-5 lg:sticky lg:top-24">
              <div className="flex items-center gap-3">
                <BookOpen
                  size={18}
                  className="text-accent"
                  aria-hidden="true"
                />

                <h2 className="text-sm font-semibold text-text-primary">
                  Module pathway
                </h2>
              </div>

              <p className="mt-2 text-xs leading-5 text-text-secondary">
                Complete each part in order to unlock the final assessment.
              </p>

              <div className="mt-6 space-y-1">
                {mod.pages.map((modulePage, index) => {
                  const completed =
                    index < progress.pagesCompleted;

                  const current =
                    pos.kind === 'reading' &&
                    pos.index === index;

                  const locked =
                    !completed && !current;

                  return (
                    <div
                      key={modulePage.id}
                      className={[
                        'flex items-start gap-3 rounded-lg px-3 py-3',
                        current
                          ? 'bg-accent/10'
                          : '',
                      ].join(' ')}
                    >
                      <div
                        className={[
                          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
                          completed
                            ? 'border-success/40 bg-success/10 text-success'
                            : current
                              ? 'border-accent bg-accent text-accent-contrast'
                              : 'border-border-strong text-text-secondary',
                        ].join(' ')}
                      >
                        {completed ? (
                          <Check size={14} aria-hidden="true" />
                        ) : locked ? (
                          <Lock size={12} aria-hidden="true" />
                        ) : (
                          <span className="text-xs font-semibold">
                            {index + 1}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p
                          className={[
                            'text-xs font-medium',
                            current || completed
                              ? 'text-text-primary'
                              : 'text-text-secondary',
                          ].join(' ')}
                        >
                          Part {index + 1}
                        </p>

                        <p
                          className={[
                            'mt-0.5 line-clamp-2 text-xs leading-5',
                            current
                              ? 'text-text-secondary'
                              : 'text-text-secondary',
                          ].join(' ')}
                        >
                          {modulePage.title}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Final assessment */}
                <div
                  className={[
                    'mt-2 flex items-start gap-3 rounded-lg border-t border-border px-3 pt-4',
                    pos.kind === 'quiz'
                      ? 'bg-accent/10 pb-3'
                      : '',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
                      progress.quizPassed
                        ? 'border-success/40 bg-success/10 text-success'
                        : pos.kind === 'quiz'
                          ? 'border-accent bg-accent text-accent-contrast'
                          : 'border-border-strong text-text-secondary',
                    ].join(' ')}
                  >
                    {progress.quizPassed ? (
                      <Check size={14} aria-hidden="true" />
                    ) : pos.kind === 'quiz' ? (
                      <ClipboardCheck
                        size={14}
                        aria-hidden="true"
                      />
                    ) : (
                      <Lock size={12} aria-hidden="true" />
                    )}
                  </div>

                  <div>
                    <p
                      className={[
                        'text-xs font-medium',
                        pos.kind === 'quiz' ||
                        progress.quizPassed
                          ? 'text-text-primary'
                          : 'text-text-secondary',
                      ].join(' ')}
                    >
                      Final assessment
                    </p>

                    <p className="mt-0.5 text-xs text-text-secondary">
                      {mod.passMark}% required
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <p className="text-xs leading-5 text-text-secondary">
                  Your progress is saved when you continue to the next
                  section.
                </p>
              </div>
            </div>
          </aside>

          {/* Main learning area */}
          <div>
            {error && (
              <div
                role="alert"
                className="mb-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
              >
                {error}
              </div>
            )}

            {pos.kind === 'reading' && page && (
              <>
                <section className="overflow-hidden rounded-xl border border-border bg-surface-raised">
                  <header className="border-b border-border px-7 py-6 sm:px-9">
                    <div className="flex items-center justify-between gap-5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                          Part {pos.kind === 'reading' ? pos.index + 1 : 0} of {mod.pages.length}
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                          {page.title}
                        </h2>
                      </div>

                      <BookOpen
                        size={22}
                        className="shrink-0 text-accent"
                        aria-hidden="true"
                      />
                    </div>
                  </header>

                  <article className="px-7 py-8 sm:px-9 sm:py-10">
                    <div className="whitespace-pre-wrap text-[16px] leading-8 text-text-secondary">
                      {page.body}
                    </div>
                  </article>
                </section>

                <div className="mt-5 rounded-lg border border-border bg-surface px-5 py-4">
                  <p className="text-sm leading-6 text-text-secondary">
                    Focus on this concept before continuing. You can return
                    to completed sections at any time using the Back button.
                  </p>
                </div>
              </>
            )}

            {pos.kind === 'quiz' && (
              <section>
                <div className="mb-7 rounded-xl border border-border bg-surface-raised p-7">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                      <Award size={20} aria-hidden="true" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                        Final assessment
                      </p>

                      <h2 className="mt-2 text-2xl font-semibold">
                        Check your understanding
                      </h2>

                      <p className="mt-3 max-w-2xl leading-7 text-text-secondary">
                        This assessment covers the concepts from this
                        module. You need {mod.passMark}% to pass. If you
                        do not pass, you can review the material and try
                        again.
                      </p>
                    </div>
                  </div>
                </div>

                <Quiz
                  questions={mod.questions}
                  passMark={mod.passMark}
                  result={quizResult}
                  busy={busy}
                  onSubmit={submitQuiz}
                  onRetry={retryQuiz}
                />
              </section>
            )}

            {/* Sequential navigation */}
            <nav className="mt-8 flex items-center justify-between border-t border-border pt-7">
              <button
                type="button"
                onClick={back}
                disabled={
                  pos.kind === 'reading' &&
                  pos.index === 0
                }
                className="inline-flex items-center gap-2 rounded-md border border-border-strong px-5 py-3 text-sm font-medium text-text-secondary transition hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={17} />
                Back
              </button>

              {isReading && (
                <button
                  type="button"
                  onClick={next}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy
                    ? 'Saving...'
                    : isLastReading
                      ? 'Continue to assessment'
                      : 'Continue'}

                  {!busy && (
                    <ChevronRight
                      size={17}
                      aria-hidden="true"
                    />
                  )}
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
}