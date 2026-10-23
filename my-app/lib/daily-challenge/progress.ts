// server-only helpers for reading user's Daily Challenge progress
import type { SupabaseClient } from "@supabase/supabase-js";
import { MAX_ATTEMPTS } from "@/lib/supabase/server";
import type { AttemptSummary, ChallengeProgress, StreakSummary } from "./types";

// columns of daily_challenges that are safe to send to browser
export const PUBLIC_COLS = "id,date,type,difficulty,input_kind,prompt_data,options,title,scenario,task";

// YYYY-MM-DD date - melbourne based
export function previousDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

// progress for one challenge: attempts, revealed hints and worked solution
export async function loadProgress(
  admin: SupabaseClient,
  userId: string,
  challengeId: string,
  allHints: string[],
  hintsRevealed: number,
): Promise<ChallengeProgress> {
  const { data: attempts } = await admin.from("challenge_attempts")
    .select("attempt_no,correct,feedback,xp_awarded,created_at")
    .eq("user_id", userId).eq("challenge_id", challengeId)
    .order("attempt_no", { ascending: true });

  const rows = attempts ?? [];
  const solved = rows.some((a) => a.correct);
  const attemptsUsed = rows.length;
  const attemptsLeft = solved ? 0 : Math.max(0, MAX_ATTEMPTS - attemptsUsed);
  const last = rows.at(-1);
  const lastAttempt: AttemptSummary | null = last
    ? { attemptNo: last.attempt_no, correct: last.correct, feedback: last.feedback,
        xpAwarded: last.xp_awarded, createdAt: last.created_at }
    : null;

  // worked solution is only revealed once user has solved it or run out of attempts
  let workedSolution: string | null = null;
  if (solved || attemptsLeft === 0) {
    const { data } = await admin.from("daily_challenge_answers")
      .select("worked_solution").eq("challenge_id", challengeId).maybeSingle();
    workedSolution = data?.worked_solution ?? null;
  }

  return {
    attemptsUsed, attemptsLeft, maxAttempts: MAX_ATTEMPTS, solved,
    hints: allHints.slice(0, hintsRevealed), hintsTotal: allHints.length,
    lastAttempt, workedSolution,
  };
}

// user's streak display
export async function loadStreak(admin: SupabaseClient, userId: string, today: string): Promise<StreakSummary> {
  // streak and XP live on profiles table
  const { data } = await admin.from("profiles")
    .select("xp,challenge_streak,best_streak,last_challenge").eq("id", userId).maybeSingle();
  if (!data) return { current: 0, best: 0, xp: 0, lastSolved: null };
  // streak whose last solve was before yesterday, lapses
  const alive = data.last_challenge === today || data.last_challenge === previousDate(today);
  return {
    current: alive ? (data.challenge_streak ?? 0) : 0,
    best: data.best_streak ?? 0,
    xp: data.xp ?? 0,
    lastSolved: data.last_challenge,
  };
}
