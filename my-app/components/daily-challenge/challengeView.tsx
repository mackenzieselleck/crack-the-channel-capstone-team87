'use client';

// dailychallenge tier: one challenge, with its data, answer input and hints
import { ChevronLeft, ChevronRight, Target } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { dailyApi, loadDraft, parseTier, saveDraft, toFailure, type ApiFailure } from '@/lib/daily-challenge/client';
import { TIER_LABEL, TYPE_LABEL, xpFor, type Submission, type TodayResponse } from '@/lib/daily-challenge/types';
import { AnswerInput, isComplete } from './answerInput';
import { ChallengeData } from './challengeData';
import { HintPanel } from './hintPanel';
import { GeneratingState, GradingOverlay } from './loading';
import { AttemptDots, ErrorCard, Eyebrow, PageShell, primaryButton, secondaryButton, useSessionExpiry } from './ui';

export function ChallengeView() {
  const params = useParams<{ tier: string }>();
  const tier = parseTier(params.tier);
  const router = useRouter();

  const [data, setData] = useState<TodayResponse | null>(null);
  const [loadError, setLoadError] = useState<ApiFailure | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [grading, setGrading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  useSessionExpiry(loadError);

  useEffect(() => {
    if (!tier) return;
    let active = true;
    dailyApi.today(tier).then(
      (res) => {
        if (!active) return;
        // finished tiers go straight to result
        if (res.progress.solved || res.progress.attemptsLeft === 0) {
          router.replace(`/daily-challenge/${tier}/result`);
          return;
        }
        setData(res);
        setSubmission(loadDraft(res.challenge.id));
      },
      (e) => active && setLoadError(toFailure(e)),
    );
    return () => {
      active = false;
      // reset so coming back shows fresh progress
      setData(null);
      setGrading(false);
      setSubmitError(null);
    };
  }, [tier, router, reloadKey]);

  const retry = () => {
    setLoadError(null);
    setReloadKey((k) => k + 1);
  };

  async function submit() {
    if (!data || !isComplete(submission) || grading) return;
    setGrading(true);
    setSubmitError(null);
    try {
      saveDraft(data.challenge.id, submission);
      await dailyApi.submit(data.challenge.id, submission);
      router.push(`/daily-challenge/${tier}/result`);
    } catch (e) {
      const err = toFailure(e);
      if (err.status === 409) {
        router.push(`/daily-challenge/${tier}/result`);
        return;
      }
      setSubmitError(err.message);
      setGrading(false);
    }
  }

  if (!tier) {
    return (
      <PageShell>
        <ErrorCard title="Challenge not found" message="Daily challenges have tiers 1, 2 and 3." />
      </PageShell>
    );
  }

  if (loadError) {
    return (
      <PageShell>
        <ErrorCard title="Unable to load this challenge" message={loadError.message} onRetry={retry} />
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl">
          <GeneratingState firstLoad />
        </div>
      </PageShell>
    );
  }

  const { challenge, progress } = data;
  const attemptNo = progress.attemptsUsed + 1;
  const xpNow = xpFor(challenge.difficulty, progress.hints.length, attemptNo);

  return (
    <PageShell>
      {grading && <GradingOverlay />}

      {/* Challenge orientation */}
      <header className="border-b border-border pb-8">
        <Eyebrow>
          Daily challenge · Tier {challenge.difficulty} · {TIER_LABEL[challenge.difficulty]}
        </Eyebrow>
        <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{challenge.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">{challenge.scenario}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-raised px-4 py-3">
            <p className="text-xs uppercase tracking-[0.15em] text-text-secondary">Worth now</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">{xpNow} XP</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 py-8 lg:grid-cols-[270px_minmax(0,1fr)]">
        {/* Attempts and hints */}
        <aside className="min-w-0 space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-surface-raised p-5">
            <div className="flex items-center gap-3">
              <Target size={18} className="text-accent" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-text-primary">Attempts</h2>
              <span className="ml-auto">
                <AttemptDots used={progress.attemptsUsed} max={progress.maxAttempts} solved={false} />
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-text-secondary">
              {progress.attemptsLeft} of {progress.maxAttempts} left. Each extra attempt costs 15 XP. The worked
              solution unlocks when you solve it or run out of attempts.
            </p>
            <p className="mt-4 border-t border-border pt-4 text-xs text-text-secondary">
              Category: {TYPE_LABEL[challenge.type] ?? challenge.type}
            </p>
          </div>

          <HintPanel
            challengeId={challenge.id}
            hints={progress.hints}
            hintsTotal={progress.hintsTotal}
            locked={false}
            onHints={(hints) => setData((d) => (d ? { ...d, progress: { ...d.progress, hints } } : d))}
          />
        </aside>

        {/* Main challenge area */}
        <div className="min-w-0 space-y-6">
          {progress.lastAttempt && !progress.lastAttempt.correct && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-danger">
                Last attempt
              </p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">{progress.lastAttempt.feedback}</p>
            </div>
          )}

          <section className="overflow-hidden rounded-xl border border-border bg-surface-raised">
            <header className="border-b border-border px-7 py-6 sm:px-9">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Your task</p>
              <h2 className="mt-2 text-xl font-semibold leading-8 tracking-tight">{challenge.task}</h2>
            </header>
            <div className="px-7 py-8 sm:px-9">
              <ChallengeData challenge={challenge} />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-surface-raised px-7 py-8 sm:px-9">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Your answer</p>
            <AnswerInput challenge={challenge} value={submission} onChange={setSubmission} disabled={grading} />
          </section>

          {submitError && (
            <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {submitError}
            </div>
          )}

          <nav className="flex items-center justify-between border-t border-border pt-7">
            <Link href="/daily-challenge" className={secondaryButton}>
              <ChevronLeft size={17} aria-hidden="true" />
              All challenges
            </Link>
            <button type="button" onClick={submit} disabled={!isComplete(submission) || grading} className={primaryButton}>
              {grading ? 'Checking...' : 'Submit answer'}
              {!grading && <ChevronRight size={17} aria-hidden="true" />}
            </button>
          </nav>
        </div>
      </div>
    </PageShell>
  );
}
