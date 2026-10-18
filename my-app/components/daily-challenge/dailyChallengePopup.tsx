'use client';

// Corner pop-up nudging users who haven't solved a Daily Challenge today.
// It lives behind the login wall: mount <DailyChallengePopup /> ONLY in the layout(s) of
// logged-in content pages (the ones guarded by requireOnboarding()), never in the root
// layout, so it can't appear on the landing page, auth pages or onboarding.
// Three states, remembered per Melbourne day in this browser:
//   - full: the card, shown until the user acts on it,
//   - mini: "Later" (or Escape) shrinks it to a small round button in the same corner that
//     opens the Daily Challenge, so it's always one click away,
//   - hidden: the × hides it completely until tomorrow.
// It never shows when:
//   - they've solved at least one tier today (their streak is safe),
//   - they're on a Daily Challenge page (the challenge is already in front of them),
//   - the status call fails for any reason (it never shows an error).
import { Flame, Swords, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { dailyApi } from '@/lib/daily-challenge/client';
import type { StatusResponse } from '@/lib/daily-challenge/types';

/** The Daily Challenge pages themselves never show the nudge. */
const CHALLENGE_PREFIX = '/daily-challenge';
/** Wait a moment after page load so the pop-up doesn't compete with the page itself. */
const SHOW_DELAY_MS = 1500;

type Mode = 'full' | 'mini' | 'hidden';
const modeKey = (date: string) => `dc-popup:${date}`;

function readMode(date: string): Mode {
  try {
    const v = localStorage.getItem(modeKey(date));
    return v === 'mini' || v === 'hidden' ? v : 'full';
  } catch {
    return 'full';   // storage unavailable: just show the card
  }
}

function saveMode(date: string, mode: Mode) {
  try { localStorage.setItem(modeKey(date), mode); } catch { /* storage unavailable */ }
}

/** Mount in logged-in content layouts only. The Suspense boundary lets pages prerender around it. */
export function DailyChallengePopup() {
  return (
    <Suspense fallback={null}>
      <Popup />
    </Suspense>
  );
}

function Popup() {
  const pathname = usePathname() ?? '/';
  const hiddenHere = pathname.startsWith(CHALLENGE_PREFIX);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [mode, setMode] = useState<Mode>('hidden');

  // Re-check on navigation so solving a challenge hides it everywhere.
  useEffect(() => {
    if (hiddenHere) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const s = await dailyApi.status();
        if (cancelled) return;
        setStatus(s);
        setMode(s.completedToday ? 'hidden' : readMode(s.date));
      } catch {
        // Session ended, rate limited or offline: stay hidden.
        if (!cancelled) setMode('hidden');
      }
    }, SHOW_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pathname, hiddenHere]);

  function change(next: Mode) {
    setMode(next);
    if (status) saveMode(status.date, next);
  }

  // Escape shrinks the card, like "Later".
  useEffect(() => {
    if (mode !== 'full') return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && change('mini');
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (hiddenHere || mode === 'hidden' || !status) return null;

  const streak = status.streak.current;
  const started = status.tiers.some((t) => t.started);
  const label = streak > 0 ? `Daily challenge: keep your ${streak}-day streak alive` : 'Daily challenge: today\'s challenge is ready';

  if (mode === 'mini') {
    return (
      <div className="group fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
        <style>{`@keyframes dc-mini-in { from { opacity: 0; transform: scale(.8); } to { opacity: 1; transform: none; } }`}</style>
        <Link
          href="/daily-challenge"
          aria-label={label}
          title={label}
          className="relative flex h-14 w-14 animate-[dc-mini-in_200ms_ease-out] items-center justify-center rounded-full border border-[#233049] bg-[#111B2E] shadow-2xl shadow-black/50 transition hover:border-[#4C8DFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F62FE]/60 motion-reduce:animate-none"
        >
          {streak > 0 ? <Flame size={24} className="text-[#FBBF24]" aria-hidden="true" /> : <Swords size={22} className="text-[#4C8DFF]" aria-hidden="true" />}
          {streak > 0 && (
            <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#0F62FE] px-1.5 text-xs font-bold text-white">
              {streak}
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => change('hidden')}
          aria-label="Hide daily challenge reminder until tomorrow"
          className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-[#34425A] bg-[#0D1728] text-[#8B95AC] opacity-0 transition hover:text-white focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <X size={12} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-labelledby="daily-popup-title"
      className="fixed bottom-4 right-4 z-40 w-[calc(100vw-2rem)] max-w-sm animate-[dc-popup-in_300ms_ease-out] rounded-xl border border-[#233049] bg-[#111B2E] p-5 text-[#E7ECF5] shadow-2xl shadow-black/50 motion-reduce:animate-none sm:bottom-6 sm:right-6"
    >
      <style>{`@keyframes dc-popup-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }`}</style>
      <button
        type="button"
        onClick={() => change('hidden')}
        aria-label="Hide until tomorrow"
        className="absolute right-3 top-3 rounded-md p-1.5 text-[#8B95AC] transition hover:bg-[#1A263A] hover:text-white"
      >
        <X size={16} aria-hidden="true" />
      </button>

      <div className="flex items-start gap-4 pr-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F62FE]/15 text-[#4C8DFF]">
          {streak > 0 ? <Flame size={20} className="text-[#FBBF24]" aria-hidden="true" /> : <Swords size={20} aria-hidden="true" />}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4C8DFF]">Daily challenge</p>
          <h2 id="daily-popup-title" className="mt-1 font-semibold leading-6">
            {streak > 0
              ? `Keep your ${streak}-day streak alive`
              : started
                ? 'Finish today\'s challenge'
                : 'Today\'s challenge is ready'}
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#8B95AC]">
            {streak > 0
              ? 'Solve any one tier before midnight to keep it going.'
              : 'A few minutes, up to 150 XP, and a streak to start.'}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Link
          href="/daily-challenge"
          onClick={() => change('mini')}
          className="inline-flex flex-1 items-center justify-center rounded-md bg-[#0F62FE] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0353E9]"
        >
          {started ? 'Continue' : 'Start challenge'}
        </Link>
        <button
          type="button"
          onClick={() => change('mini')}
          className="rounded-md border border-[#34425A] px-4 py-2.5 text-sm font-medium text-[#C5CDD9] transition hover:border-[#8B95AC] hover:text-white"
        >
          Later
        </button>
      </div>
    </aside>
  );
}