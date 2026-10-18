'use client';

// /daily-challenge: today's three tiers, streak and XP.
import { Award, Check, ChevronRight, Flame, Sparkles, Trophy, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { dailyApi, toFailure, type ApiFailure } from '@/lib/daily-challenge/client';
import { TIER_LABEL, TYPE_LABEL, xpFor, type StatusResponse, type TierStatus } from '@/lib/daily-challenge/types';
import { Spinner } from './loading';
import { AttemptDots, ErrorCard, Eyebrow, PageShell, useSessionExpiry } from './ui';

const TIER_BLURB = {
  1: 'A quick one to keep your streak going.',
  2: 'Puts the core ideas to work.',
  3: 'Multi-step. Take your time.',
} as const;

export function ChallengeHub() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<ApiFailure | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  useSessionExpiry(error);

  useEffect(() => {
    let active = true;
    dailyApi.status().then(
      (s) => active && setStatus(s),
      (e) => active && setError(toFailure(e)),
    );
    return () => {
      active = false;
      setStatus(null);   // refetch fresh progress when the hub is revisited
    };
  }, [reloadKey]);

  const retry = () => {
    setError(null);
    setReloadKey((k) => k + 1);
  };

  return (
    <PageShell>
      <header className="border-b border-[#233049] pb-8">
        <Eyebrow>Daily challenge</Eyebrow>
        <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Today&apos;s challenges</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#AAB4C5]">
              Three new challenges every day, one per tier. Solve any one to keep your streak alive, and solve
              more for extra XP. Every answer is checked with exact maths and real Qiskit circuits.
            </p>
          </div>
          {status && (
            <p className="text-sm text-[#8B95AC]">
              Resets at midnight, Melbourne time
            </p>
          )}
        </div>
      </header>

      <div className="py-8">
        {error ? (
          <ErrorCard title="Unable to load today's challenges" message={error.message} onRetry={retry} />
        ) : !status ? (
          <div className="flex justify-center py-20" role="status" aria-label="Loading">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Streak and XP */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat
                Icon={Flame}
                label="Current streak"
                value={`${status.streak.current} day${status.streak.current === 1 ? '' : 's'}`}
                note={status.completedToday ? 'Safe for today' : status.streak.current > 0 ? 'Solve one today to keep it' : 'Solve one to start a streak'}
                highlight={!status.completedToday && status.streak.current > 0}
              />
              <Stat Icon={Trophy} label="Best streak" value={`${status.streak.best} day${status.streak.best === 1 ? '' : 's'}`} />
              <Stat Icon={Award} label="Total XP" value={status.streak.xp.toLocaleString()} />
            </div>

            {/* Tiers */}
            <div className="grid gap-5 lg:grid-cols-3">
              {status.tiers.map((t) => (
                <TierCard key={t.difficulty} tier={t} />
              ))}
            </div>

            <div className="rounded-lg border border-[#233049] bg-[#0D1728] px-5 py-4">
              <p className="text-sm leading-6 text-[#8B95AC]">
                You get 3 attempts per tier. XP is 50 per tier level, minus 10 for each hint you reveal and 15 for
                each extra attempt, and you always earn at least 10 XP for a correct answer.
              </p>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function Stat({
  Icon,
  label,
  value,
  note,
  highlight,
}: {
  Icon: typeof Flame;
  label: string;
  value: string;
  note?: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#233049] bg-[#111B2E] p-5">
      <div className="flex items-center gap-2">
        <Icon size={16} className={highlight ? 'text-[#FBBF24]' : 'text-[#4C8DFF]'} aria-hidden="true" />
        <p className="text-xs uppercase tracking-[0.15em] text-[#8B95AC]">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      {note && <p className={['mt-1 text-xs', highlight ? 'text-[#FBBF24]' : 'text-[#69758A]'].join(' ')}>{note}</p>}
    </div>
  );
}

function TierCard({ tier }: { tier: TierStatus }) {
  const out = tier.started && !tier.solved && tier.attemptsLeft === 0;
  const finished = tier.solved || out;
  const href = finished ? `/daily-challenge/${tier.difficulty}/result` : `/daily-challenge/${tier.difficulty}`;
  const cta = tier.solved ? 'Review' : out ? 'See solution' : tier.started ? 'Continue' : 'Start';

  return (
    <Link
      href={href}
      className={[
        'group flex flex-col rounded-xl border bg-[#111B2E] p-6 transition',
        tier.solved ? 'border-[#4ADE80]/30' : 'border-[#233049] hover:border-[#4C8DFF]/60',
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4C8DFF]">
          Tier {tier.difficulty} · {TIER_LABEL[tier.difficulty]}
        </p>
        <StatusBadge tier={tier} />
      </div>

      <h2 className="mt-4 text-xl font-semibold tracking-tight">
        {tier.title ?? 'Mystery challenge'}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#8B95AC]">
        {tier.type ? TYPE_LABEL[tier.type] : TIER_BLURB[tier.difficulty]}
      </p>

      <div className="mt-6 flex items-center justify-between border-t border-[#233049] pt-4">
        <span className="text-sm text-[#AAB4C5]">
          {tier.solved ? (
            'Solved'
          ) : (
            <>Up to <span className="font-semibold text-[#E7ECF5]">{xpFor(tier.difficulty, 0, 1)} XP</span></>
          )}
        </span>
        {tier.started && <AttemptDots used={tier.attemptsUsed} max={3} solved={tier.solved} />}
      </div>

      <span
        className={[
          'mt-5 inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition',
          finished
            ? 'border border-[#34425A] text-[#C5CDD9] group-hover:border-[#8B95AC] group-hover:text-white'
            : 'bg-[#0F62FE] text-white group-hover:bg-[#0353E9]',
        ].join(' ')}
      >
        {cta}
        <ChevronRight size={16} aria-hidden="true" />
      </span>
    </Link>
  );
}

function StatusBadge({ tier }: { tier: TierStatus }) {
  if (tier.solved)
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#4ADE80]/40 bg-[#4ADE80]/10 px-2.5 py-1 text-xs font-medium text-[#4ADE80]">
        <Check size={12} aria-hidden="true" /> Solved
      </span>
    );
  if (tier.started && tier.attemptsLeft === 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#F87171]/40 bg-[#F87171]/10 px-2.5 py-1 text-xs font-medium text-[#FCA5A5]">
        <X size={12} aria-hidden="true" /> No attempts left
      </span>
    );
  if (tier.started)
    return (
      <span className="rounded-full border border-[#34425A] px-2.5 py-1 text-xs font-medium text-[#C5CDD9]">
        {tier.attemptsLeft} attempt{tier.attemptsLeft === 1 ? '' : 's'} left
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#0F62FE]/40 bg-[#0F62FE]/10 px-2.5 py-1 text-xs font-medium text-[#4C8DFF]">
      <Sparkles size={12} aria-hidden="true" /> New
    </span>
  );
}
