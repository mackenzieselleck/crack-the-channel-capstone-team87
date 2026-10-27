'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Badge } from '@/lib/badges/types';
import { BadgeArt } from './badgeArt';

type UnseenRow = { badge_id: string; badges: Badge | null };

// Shows unseen badge awards on protected pages.
export function BadgeUnlockProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const pathname = usePathname();
  const [queue, setQueue] = useState<Badge[]>([]);
  const dismissed = useRef(new Set<string>()); // stops refetch of badge
  const saving = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dismissError, setDismissError] = useState<string | null>(null);
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
      return [...prev, ...unseen.filter((b) => !queued.has(b.id) && !dismissed.current.has(b.id))];
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
    if (!current || saving.current) return;
    saving.current = true;
    setIsSaving(true);
    setDismissError(null);

    try {
      const { error } = await supabase.rpc('mark_badges_seen', { p_badge_ids: [current.id] });
      if (error) throw error;

      dismissed.current.add(current.id);
      setQueue((q) => q.filter((badge) => badge.id !== current.id));
    } catch {
      setDismissError("We couldn't save your dismissal. Your badge is safe. Please try again.");
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  }, [current, supabase]);

  return (
    <>
      {children}
      {current && (
        <BadgeUnlockDialog
          key={current.id}
          badge={current}
          onClose={dismiss}
          isSaving={isSaving}
          error={dismissError}
        />
      )}
    </>
  );
}

function BadgeUnlockDialog({ badge, onClose, isSaving, error }: {
  badge: Badge;
  onClose: () => void;
  isSaving: boolean;
  error: string | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    // The native modal makes the rest of the page inert and contains Tab focus.
    dialog?.showModal();
    closeRef.current?.focus();
    return () => {
      dialog?.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby="badge-unlock-title"
      aria-describedby={error ? 'badge-unlock-error' : undefined}
      aria-busy={isSaving}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none items-center justify-center bg-transparent p-6 text-inherit backdrop:bg-black/60 open:flex"
      onCancel={(e) => {
        // Keep the modal open until the dismissal is saved, including Escape.
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key !== 'Tab') return;
        const controls = e.currentTarget.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        );
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }}
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

        {error && (
          <p id="badge-unlock-error" role="alert" className="mt-4 text-sm text-text-primary">
            {error}
          </p>
        )}

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-disabled={isSaving}
          className="mt-6 w-full rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast transition hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          {isSaving ? 'Saving...' : error ? 'Try again' : 'Continue'}
        </button>
      </div>
    </dialog>
  );
}
