'use client';

// /daily-challenge/[tier]/result: the outcome of the latest submission.
// Reads everything from the server (feedback and XP are stored with each attempt),
// so the page survives a refresh and can be revisited from the hub.
import { Award, BookOpenCheck, Check, ChevronLeft, ChevronRight, Flame, RotateCcw, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { dailyApi, parseTier, toFailure, type ApiFailure } from '@/lib/daily-challenge/client';
import { TIER_LABEL, type StatusResponse, type TodayResponse } from '@/lib/daily-challenge/types';
import { Spinner } from './loading';
import { MathText } from './mathText';
import { AttemptDots, ErrorCard, Eyebrow, PageShell, primaryButton, secondaryButton, useSessionExpiry } from './ui';

export function ResultView() {
  const params = useParams<{ tier: string }>();
  const tier = parseTier(params.tier);
  const router = useRouter();
  const [data, setData] = useState<TodayResponse | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<ApiFailure | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  useSessionExpiry(error);
    
  useEffect(() => {
    if (!tier) return;
    let active = true;
    Promise.all([dailyApi.today(tier), dailyApi.status()]).then(
      ([today, st]) => {
        if (!active) return;
        // Nothing submitted yet: this tier's result doesn't exist, so go to the challenge.
        if (!today.progress.lastAttempt) {
          router.replace(`/daily-challenge/${tier}`);
          return;
        }
        setData(today);
        setStatus(st);
      },
      (e) => active && setError(toFailure(e)),
    );
    return () => {
      active = false;
      setData(null);   // never flash a previous attempt's result when this page is revisited
    };
  }, [tier, router, reloadKey]);

  const retry = () => {
    setError(null);
    setReloadKey((k) => k + 1);
  };

  if (!tier) {
    return (
      <PageShell>
        <ErrorCard title="Result not found" message="Daily challenges have tiers 1, 2 and 3." />
      </PageShell>
    );
  }
  if (error) {
    return (
      <PageShell>
        <ErrorCard title="Unable to load your result" message={error.message} onRetry={retry} />
      </PageShell>
    );
  }
  if (!data || !data.progress.lastAttempt) {
    return (
      <PageShell>
        <div className="flex justify-center py-24" role="status" aria-label="Loading your result">
          <Spinner />
        </div>
      </PageShell>
    );
  }

  const { challenge, progress } = data;
  const last = data.progress.lastAttempt;
  const solved = progress.solved;
  const out = !solved && progress.attemptsLeft === 0;
  const nextTier = status?.tiers.find((t) => !t.solved && t.attemptsLeft > 0 && t.difficulty !== challenge.difficulty);

  const tone = solved
    ? { ring: 'border-[#4ADE80]/40 bg-[#4ADE80]/10 text-[#4ADE80]', Icon: Check, heading: 'Correct!', eyebrow: 'Challenge solved' }
    : out
      ? { ring: 'border-[#F87171]/40 bg-[#F87171]/10 text-[#FCA5A5]', Icon: X, heading: 'Out of attempts', eyebrow: 'Challenge closed' }
      : { ring: 'border-[#F87171]/40 bg-[#F87171]/10 text-[#FCA5A5]', Icon: X, heading: 'Not quite', eyebrow: `Attempt ${last.attemptNo} of ${progress.maxAttempts}` };

  return (
    <PageShell>
      <header className="border-b border-[#233049] pb-8">
        <Eyebrow>
          Daily challenge · Tier {challenge.difficulty} · {TIER_LABEL[challenge.difficulty]} · Result
        </Eyebrow>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{challenge.title}</h1>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 py-8">
        {/* Outcome */}
        <section className="overflow-hidden rounded-xl border border-[#233049] bg-[#111B2E]">
          <div className="flex flex-col gap-6 px-7 py-8 sm:flex-row sm:items-center sm:px-9">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full border ${tone.ring}`}>
              <tone.Icon size={30} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B95AC]">{tone.eyebrow}</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight" role="status">
                {tone.heading}
              </h2>
              <div className="mt-3 flex items-center gap-3 text-sm text-[#8B95AC]">
                <AttemptDots used={progress.attemptsUsed} max={progress.maxAttempts} solved={solved} />
                <span>
                  {solved
                    ? `Solved on attempt ${last.attemptNo}`
                    : out
                      ? 'All attempts used'
                      : `${progress.attemptsLeft} attempt${progress.attemptsLeft === 1 ? '' : 's'} left`}
                </span>
              </div>
            </div>
          </div>

          {solved && (
            <div className="grid border-t border-[#233049] sm:grid-cols-2">
              <div className="flex items-center gap-3 px-7 py-5 sm:px-9">
                <Award size={20} className="text-[#4C8DFF]" aria-hidden="true" />
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-[#8B95AC]">XP earned</p>
                  <p className="text-lg font-semibold">+{last.xpAwarded ?? '—'} XP</p>
                </div>
              </div>
              {status && (
                <div className="flex items-center gap-3 border-t border-[#233049] px-7 py-5 sm:border-l sm:border-t-0 sm:px-9">
                  <Flame size={20} className="text-[#FBBF24]" aria-hidden="true" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-[#8B95AC]">Streak</p>
                    <p className="text-lg font-semibold">
                      {status.streak.current} day{status.streak.current === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Feedback (LLM-phrased from the grader's explanation; plain text) */}
        {last.feedback && (
          <section className="rounded-xl border border-[#233049] bg-[#111B2E] px-7 py-7 sm:px-9">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4C8DFF]">Feedback</p>
            <p className="mt-3 whitespace-pre-wrap text-[16px] leading-8 text-[#C5CDD9]">{last.feedback}</p>
          </section>
        )}

        {/* Worked solution: only sent by the server once solved or out of attempts */}
        {progress.workedSolution ? (
          <section className="rounded-xl border border-[#233049] bg-[#111B2E] px-7 py-7 sm:px-9">
            <div className="flex items-center gap-3">
              <BookOpenCheck size={18} className="text-[#4C8DFF]" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4C8DFF]">Worked solution</p>
            </div>
            <div className="mt-4 overflow-x-auto rounded-lg border border-[#233049] bg-[#0D1728] px-5 py-4 text-[15px] leading-7 text-[#E7ECF5]">
              <MathText text={progress.workedSolution} display />
            </div>
          </section>
        ) : (
          <div className="rounded-lg border border-[#233049] bg-[#0D1728] px-5 py-4">
            <p className="text-sm leading-6 text-[#8B95AC]">
              The worked solution unlocks when you solve this challenge or use all {progress.maxAttempts} attempts.
              {progress.hints.length < progress.hintsTotal && ' A hint might help before your next try.'}
            </p>
          </div>
        )}

        {/* Next steps */}
        <nav className="flex flex-col-reverse gap-3 border-t border-[#233049] pt-7 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/daily-challenge" className={secondaryButton}>
            <ChevronLeft size={17} aria-hidden="true" />
            All challenges
          </Link>
          {!solved && !out ? (
            <Link href={`/daily-challenge/${challenge.difficulty}`} className={primaryButton}>
              <RotateCcw size={16} aria-hidden="true" />
              Try again
            </Link>
          ) : nextTier ? (
            <Link href={`/daily-challenge/${nextTier.difficulty}`} className={primaryButton}>
              {nextTier.started ? 'Continue' : 'Try'} tier {nextTier.difficulty}
              <ChevronRight size={17} aria-hidden="true" />
            </Link>
          ) : (
            <p className="text-sm text-[#8B95AC]">That&apos;s everything for today. New challenges at midnight.</p>
          )}
        </nav>
      </div>
    </PageShell>
  );
}
