'use client';

// small shared pieces for Daily Challenge pages
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { ApiFailure } from '@/lib/daily-challenge/client';

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#0B1220] px-6 pb-24 pt-10 text-[#E7ECF5]">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#4C8DFF]">{children}</p>
  );
}

export function ErrorCard({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#FCA5A5]" aria-hidden="true" />
        <div>
          <p className="font-semibold text-[#FCA5A5]">{title}</p>
          <p className="mt-2 text-sm leading-6 text-[#C5CDD9]">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 rounded-md border border-[#34425A] px-4 py-2 text-sm font-medium text-[#C5CDD9] transition hover:border-[#8B95AC] hover:text-white"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


export function useSessionExpiry(error: ApiFailure | null) {
  const router = useRouter();
  useEffect(() => {
    if (error?.status === 401) router.refresh();
  }, [error, router]);
}

// attempt indicator: filled dots for used attempts
export function AttemptDots({ used, max, solved }: { used: number; max: number; solved: boolean }) {
  return (
    <span className="flex items-center gap-1.5" aria-label={`${used} of ${max} attempts used`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < used;
        const winning = solved && i === used - 1;
        return (
          <span
            key={i}
            className={[
              'h-2.5 w-2.5 rounded-full border',
              winning
                ? 'border-[#4ADE80] bg-[#4ADE80]'
                : filled
                  ? 'border-[#F87171]/70 bg-[#F87171]/70'
                  : 'border-[#34425A] bg-transparent',
            ].join(' ')}
          />
        );
      })}
    </span>
  );
}

export const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-md bg-[#0F62FE] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0353E9] disabled:cursor-not-allowed disabled:opacity-50';
export const secondaryButton =
  'inline-flex items-center justify-center gap-2 rounded-md border border-[#34425A] px-5 py-3 text-sm font-medium text-[#C5CDD9] transition hover:border-[#8B95AC] hover:text-white disabled:cursor-not-allowed disabled:opacity-30';
