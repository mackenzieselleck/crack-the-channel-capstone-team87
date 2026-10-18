'use client';

import { useEffect, useState } from 'react';

// loading wheel used across Daily Challenge
export function Spinner({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`animate-spin motion-reduce:animate-[spin_3s_linear_infinite] ${className}`}
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="20" fill="none" stroke="#233049" strokeWidth="5" />
      <path
        d="M24 4 a20 20 0 0 1 20 20"
        fill="none"
        stroke="#0F62FE"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Cycles through status messages while a slow request runs; adds a reassurance after `slowAfterMs`. */
function useRotatingMessage(messages: string[], intervalMs = 2600, slowAfterMs = 9000) {
  const [index, setIndex] = useState(0);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const tick = setInterval(() => setIndex((i) => Math.min(i + 1, messages.length - 1)), intervalMs);
    const slowTimer = setTimeout(() => setSlow(true), slowAfterMs);
    return () => {
      clearInterval(tick);
      clearTimeout(slowTimer);
    };
  }, [messages.length, intervalMs, slowAfterMs]);
  return { message: messages[index], slow };
}

const GRADING_MESSAGES = [
  'Sending your answer to the grader...',
  'Checking it with exact maths and the Qiskit simulator...',
  'Writing your feedback...',
];

/** Full-screen overlay shown while a submission is graded. */
export function GradingOverlay() {
  const { message, slow } = useRotatingMessage(GRADING_MESSAGES);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1220]/80 px-6 backdrop-blur-sm">
      <div
        role="status"
        aria-live="polite"
        className="w-full max-w-sm rounded-xl border border-[#233049] bg-[#111B2E] p-8 text-center shadow-2xl shadow-black/40"
      >
        <Spinner size={52} className="mx-auto" />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#4C8DFF]">
          Grading your answer
        </p>
        <p className="mt-3 min-h-12 text-sm leading-6 text-[#C5CDD9]">{message}</p>
        {slow && (
          <p className="mt-3 text-xs leading-5 text-[#8B95AC]">
            The grader can take up to 30 seconds if it has been idle. Your attempt is safe.
          </p>
        )}
      </div>
    </div>
  );
}

const GENERATING_MESSAGES = [
  'Preparing today\'s challenge...',
  'Running the circuits on the simulator...',
  'Writing your scenario and hints...',
];

/** In-page loading state while a challenge is fetched or generated. */
export function GeneratingState({ firstLoad }: { firstLoad: boolean }) {
  const { message, slow } = useRotatingMessage(GENERATING_MESSAGES);
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center rounded-xl border border-[#233049] bg-[#111B2E] px-6 py-16 text-center"
    >
      <Spinner size={48} />
      <p className="mt-6 text-sm font-semibold text-[#E7ECF5]">
        {firstLoad ? message : 'Loading your challenge...'}
      </p>
      {slow && (
        <p className="mt-2 max-w-sm text-xs leading-5 text-[#8B95AC]">
          The first challenge of the day takes a few extra seconds to build.
        </p>
      )}
    </div>
  );
}
