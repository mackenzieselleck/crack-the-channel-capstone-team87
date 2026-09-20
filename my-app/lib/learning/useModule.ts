'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { resumePosition, percentComplete } from './progress';
import {
  EMPTY_PROGRESS,
  type LearningModule,
  type ModuleProgress,
  type Position,
  type QuizResult,
} from './types';


export function useModule(slug: string) {
  const supabase = createClient();

  const [mod, setMod] = useState<LearningModule | null>(null);
  const [progress, setProgress] = useState<ModuleProgress>(EMPTY_PROGRESS);
  const [pos, setPos] = useState<Position>({ kind: 'reading', index: 0 });
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Load module content + this user's progress, then resume where they left off ──
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      const { data, error: modErr } = await supabase
        .from('modules')
        .select(
          `id, slug, title, pass_mark,
           module_pages ( id, position, title, body ),
           quiz_questions ( id, position, prompt, options )`,
        )
        .eq('slug', slug)
        .order('position', { referencedTable: 'module_pages' })
        .order('position', { referencedTable: 'quiz_questions' })
        .single();

      if (cancelled) return;
      if (modErr || !data) {
        console.error('Module load failed:', modErr);
        setError('Could not load this module.');
        setLoading(false);
        return;
      }

      const loaded: LearningModule = {
        id: data.id,
        slug: data.slug,
        title: data.title,
        passMark: data.pass_mark,
        pages: data.module_pages,
        questions: data.quiz_questions,
      };

      const { data: row } = await supabase
        .from('module_progress')
        .select('pages_completed, quiz_passed, best_score, completed_at')
        .eq('module_id', loaded.id)
        .maybeSingle(); // RLS already limits this to the current user

      if (cancelled) return;

      const p: ModuleProgress = row
        ? {
            pagesCompleted: row.pages_completed,
            quizPassed: row.quiz_passed,
            bestScore: row.best_score,
            completedAt: row.completed_at,
          }
        : EMPTY_PROGRESS;

      setMod(loaded);
      setProgress(p);
      setPos(resumePosition(p, loaded.pages.length));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // ── Next: only hits the server when the user is moving past their furthest step ──
  const next = useCallback(async () => {
    if (!mod || pos.kind !== 'reading' || busy) return;

    if (pos.index >= progress.pagesCompleted) {
      setBusy(true);
      const { data, error: rpcErr } = await supabase.rpc('increment_progress', {
        p_module_id: mod.id,
        p_page_index: pos.index,
      });
      setBusy(false);

      if (rpcErr || !data) {
        setError('Could not save your progress. Please try again.');
        return;
      }
      setProgress({
        pagesCompleted: data.pages_completed,
        quizPassed: data.quiz_passed,
        bestScore: data.best_score,
        completedAt: data.completed_at,
      });
    }

    setPos(
      pos.index + 1 < mod.pages.length
        ? { kind: 'reading', index: pos.index + 1 }
        : { kind: 'quiz' },
    );
  }, [mod, pos, progress.pagesCompleted, busy, supabase]);

  // ── Back: free navigation to already-completed content ──
  const back = useCallback(() => {
    if (!mod) return;
    setQuizResult(null);
    if (pos.kind === 'quiz') setPos({ kind: 'reading', index: mod.pages.length - 1 });
    else if (pos.index > 0) setPos({ kind: 'reading', index: pos.index - 1 });
  }, [mod, pos]);

  // ── Submit test: grading happens in the database, never in the browser ──
  const submitQuiz = useCallback(
    async (answers: Record<string, number>) => {
      if (!mod || busy) return;
      setBusy(true);
      setError(null);

      const { data, error: rpcErr } = await supabase.rpc('submit_quiz', {
        p_module_id: mod.id,
        p_answers: answers,
      });
      setBusy(false);

      if (rpcErr || !data) {
        console.error('Quiz submit failed:', rpcErr); 
        setError('Could not submit the test. Please try again.');
        return;
      }

      const result = data as QuizResult;
      setQuizResult(result);
      setProgress((p) => ({
        ...p,
        quizPassed: p.quizPassed || result.passed,
        bestScore: Math.max(p.bestScore ?? 0, result.score),
        completedAt: p.completedAt ?? (result.passed ? new Date().toISOString() : null),
      }));
    },
    [mod, busy, supabase],
  );

  const retryQuiz = useCallback(() => setQuizResult(null), []);

  return {
    mod,
    progress,
    pos,
    quizResult,
    loading,
    busy,
    error,
    percent: mod ? percentComplete(progress, mod.pages.length) : 0,
    next,
    back,
    submitQuiz,
    retryQuiz,
  };


}