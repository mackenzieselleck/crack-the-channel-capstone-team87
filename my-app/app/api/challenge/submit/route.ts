// user submits answer -> grading is done by Python service
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { writeFeedback } from "@/lib/daily-challenge/prompts";
import { gradeModuleMcq } from "@/lib/daily-challenge/moduleMcq";
import { createAdminClient, createClient, MAX_ATTEMPTS, MODULE_MCQ, qiskit, melbourneDate } from "@/lib/supabase/server";
import { limitRoute, llmAllowed } from "@/lib/daily-challenge/rateLimit";
import { loadStreak } from "@/lib/daily-challenge/progress";
import type { SubmitResponse } from "@/lib/daily-challenge/types";
import { createLlmDeadline } from "@/lib/daily-challenge/deadline";

// grading plus feedback can take a while
export const maxDuration = 60;

// submission must match exactly one answer format per input type
const Body = z.object({
  challengeId: z.string().uuid(),
  hintsUsed: z.number().int().min(0).max(3).default(0),
  submission: z.union([
    z.object({ option_id: z.string().max(2) }),                            // multiple choice
    z.object({ bits: z.string().regex(/^[01]{1,64}$/) }),                  // bit string (sifting)
    z.object({ text: z.string().max(40) }),                                // typed maths or a word
    z.object({ amplitudes: z.array(z.string().max(40)).max(4) }),          // state amplitudes
    z.object({ circuit: z.array(z.string().max(12)).max(20) }),            // circuit builder tokens
    z.object({ abort: z.boolean(), qber_pct: z.number().min(0).max(100).optional() }),  // abort decision
    z.object({ rate_pct: z.number().min(0).max(100) }),                    // intercept rate (play as Eve)
  ]),
});

export async function POST(req: NextRequest) {
  const deadlineAt = createLlmDeadline();
  // ---- Authenticate: read the signed in user from their session cookie
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "sign in required" }, { status: 401 });
  const userId = user.id;
  const limited = await limitRoute(userId, "submit");
  if (limited) return limited;
  // admin client for server only answers table
  const admin = createAdminClient();

  // ---- Validate request body
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid submission" }, { status: 400 });
  const { challengeId, submission } = parsed.data;

  // challenges are per user, so challenge must belong to caller
  const { data: ch } = await admin.from("daily_challenges")
    .select("id,type,difficulty,date,hints_revealed").eq("id", challengeId).eq("user_id", userId).maybeSingle();
  if (!ch) return NextResponse.json({ error: "not found" }, { status: 404 });
  // Only today's challenges can be answered
  if (ch.date !== melbourneDate()) return NextResponse.json({ error: "This challenge has expired. Today's is ready for you." }, { status: 410 });


  // ---- Check previous attempts: stop if already solved or out of attempts
  const { data: prior } = await admin.from("challenge_attempts")
    .select("correct").eq("user_id", userId).eq("challenge_id", challengeId);
  if (prior?.some((a) => a.correct)) return NextResponse.json({ error: "already solved" }, { status: 409 });
  const attemptNo = (prior?.length ?? 0) + 1;
  if (attemptNo > MAX_ATTEMPTS) return NextResponse.json({ error: "no attempts left" }, { status: 429 });

  // ---- Load answer from server only table
  const { data: secret } = await admin.from("daily_challenge_answers")
    .select("answer,worked_solution,leak_terms").eq("challenge_id", challengeId).single();
  if (!secret) return NextResponse.json({ error: "server error" }, { status: 500 });

  // ---- Grade: module questions here, everything else in Python service
  type Grade = { correct: boolean; mistake_tag: string | null; explanation: string };
  let grade: Grade;
  try {
    grade = ch.type === MODULE_MCQ
      ? gradeModuleMcq(secret.answer, submission)
      : await qiskit<Grade>("/challenges/grade", { type: ch.type, answer: secret.answer, submission });
  } catch {
    // don't consume an attempt if grading is unavailable
    return NextResponse.json({ error: "Grading unavailable, try again shortly" }, { status: 503 });
  }

  // ---- Feedback: LLM rephrases grader's explanation
  const attemptsLeft = grade.correct ? 0 : MAX_ATTEMPTS - attemptNo;
  const feedback = await writeFeedback({
    type: ch.type, correct: grade.correct, mistake_tag: grade.mistake_tag,
    explanation: grade.explanation, attemptsLeft, leakTerms: secret.leak_terms ?? [],
    useLlm: Date.now() < deadlineAt && await llmAllowed(userId),
    deadlineAt,
  });

  // ---- Record attempt
  const hintsUsed = ch.hints_revealed ?? 0;
  const { data: attempt, error: insertError } = await admin.from("challenge_attempts").insert({
    user_id: userId, challenge_id: challengeId, attempt_no: attemptNo,
    submission, correct: grade.correct, mistake_tag: grade.mistake_tag, hints_used: hintsUsed, feedback,
   }).select("id").single();
  if (insertError) {
    // 23505 = unique violation: a second submission for the same attempt number arrived at once
    if (insertError.code === "23505") return NextResponse.json({ error: "That answer is already being checked." }, { status: 409 });
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }

  // ---- On correct answer award XP and update streak
 let xpAwarded: number | null = null;
  if (grade.correct) {
    const { data: solve, error: solveError } = await admin.rpc("record_daily_solve", {
      p_user_id: userId, p_tier: ch.difficulty, p_hints_used: hintsUsed, p_attempt: attemptNo,
    });
    if (solveError) console.error("[daily-challenge] record_daily_solve failed:", solveError.code);
    const gained = (solve as { xpAwarded?: unknown } | null)?.xpAwarded;
    xpAwarded = typeof gained === "number" ? gained : null;
    if (xpAwarded !== null) await admin.from("challenge_attempts").update({ xp_awarded: xpAwarded }).eq("id", attempt.id);
  }

  // ---- Respond: worked solution is only revealed once solved or out of attempts
  const reveal = grade.correct || attemptsLeft === 0;
  const body: SubmitResponse = {
    correct: grade.correct,
    feedback,
    attemptsUsed: attemptNo,
    attemptsLeft,
    workedSolution: reveal ? secret.worked_solution : null,
    xpAwarded,
    streak: grade.correct ? await loadStreak(admin, userId, ch.date) : null,
  };
  return NextResponse.json(body);
}
