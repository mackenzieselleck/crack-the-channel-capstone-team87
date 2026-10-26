'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Badge } from '@/lib/badges/types';
import { BadgeArt } from './badgeArt';

type UnseenRow = { badge_id: string; badges: Badge | null };

// shows unlock popup on any (protected) page on user earning a badge that they haven't dismiised yet
export function BadgeUnlockProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const pathname = usePathname();
  const [queue, setQueue] = useState<Badge[]>([]);
  const dismissed = useRef(new Set<string>()); // stops refetch of badge
  const current = queue[0];

  const loadUnseen = useCallback(async () => {
    const { data, error } = await supabase
      .from('user_badges')
      .select('badge_id, badges(id, slug, title, description, artboard, icon_url)')
      .eq('user_id', userId)
      .is('seen_at', null)
      .order('earned_at');

    if (error || !data) return;

    const unseen = (data as unknown as UnseenRow[])
      .map((row) => row.badges)
      .filter((b): b is Badge => !!b?.artboard && !dismissed.current.has(b.id));

    setQueue((prev) => {
      const queued = new Set(prev.map((b) => b.id));
      return [...prev, ...unseen.filter((b) => !queued.has(b.id))];
    });
  }, [supabase, userId]);

  // check on first load and on every navigation between (protected) pages
  useEffect(() => {
    void loadUnseen();
  }, [loadUnseen, pathname]);

  // show popup straight away when a badge is awarded
  useEffect(() => {
    const channel = supabase
      .channel(`user-badges:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_badges', filter: `user_id=eq.${userId}` },
        () => void loadUnseen(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, userId, loadUnseen]);

  const dismiss = useCallback(async () => {
    if (!current) return;
    dismissed.current.add(current.id);
    setQueue((q) => q.slice(1));
    await supabase.rpc('mark_badges_seen', { p_badge_ids: [current.id] });
  }, [current, supabase]);

  return (
    <>
      {children}
      {current && <BadgeUnlockDialog key={current.id} badge={current} onClose={dismiss} />}
    </>
  );
}

function BadgeUnlockDialog({ badge, onClose }: { badge: Badge; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-unlock-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-surface-raised p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Badge unlocked</p>

          <BadgeArt
          artboard={badge.artboard}
          fallbackSrc={badge.icon_url}
          className="mx-auto mt-4 aspect-[2/3] w-56"
          />

        <h2 id="badge-unlock-title" className="mt-4 text-xl font-semibold text-text-primary">
          {badge.title}
        </h2>
        {badge.description && (
          <p className="mt-2 text-sm leading-6 text-text-secondary">{badge.description}</p>
        )}

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast transition hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          Continue
        </button>
      </div>
    </div>
  );
}