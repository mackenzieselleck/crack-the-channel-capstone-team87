// POST /api/challenge/submit
// user submits answer -> grading is done by Python service
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { writeFeedback } from "@/lib/daily_challenges/prompts";
import { gradeModuleMcq } from "@/lib/daily_challenges/moduleMcq";
import { createAdminClient, createClient, MAX_ATTEMPTS, MODULE_MCQ, qiskit } from "@/lib/supabase/server";

// size limited, shape checked request body
// `submission` must match exactly one answer format below, one per input_kind:
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
  // ---- Authenticate: read the signed in user from their session cookie
  // getUser() verifies session with Supabase rather than trusting cookie alone
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "sign in required" }, { status: 401 });
  const userId = user.id;
  // admin client for server only answers table
  const admin = createAdminClient();

  // ---- Validate request body
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid submission" }, { status: 400 });
  const { challengeId, submission, hintsUsed } = parsed.data;

  // challenges are per user, so challenge must belong to caller
  const { data: ch } = await admin.from("daily_challenges")
    .select("id,type,difficulty,date").eq("id", challengeId).eq("user_id", userId).maybeSingle();
  if (!ch) return NextResponse.json({ error: "not found" }, { status: 404 });

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
    return NextResponse.json({ error: "grading unavailable, try again shortly" }, { status: 503 });
  }

  // ---- Feedback: LLM rephrases grader's explanation
  const attemptsLeft = grade.correct ? 0 : MAX_ATTEMPTS - attemptNo;
  const feedback = await writeFeedback({
    type: ch.type, correct: grade.correct, mistake_tag: grade.mistake_tag,
    explanation: grade.explanation, attemptsLeft, leakTerms: secret.leak_terms ?? [],
  });

  // ---- Record attempt (the mistake tag is kept for analytics)
  const { error: attemptError } = await admin.from("challenge_attempts").insert({
    user_id: userId, challenge_id: challengeId, attempt_no: attemptNo,
    submission, correct: grade.correct, mistake_tag: grade.mistake_tag, hints_used: hintsUsed,
  });
  // duplicate attempt number means the same answer was submitted twice at once
  // (e.g. a double click). Stop here so XP isn't awarded twice
  if (attemptError) {
    return NextResponse.json({ error: "submission already being processed" }, { status: 409 });
  }

  // ---- On a correct answer, award XP and update streak
  // record_daily_solve validates its inputs, uses the Melbourne date, and returns what was awarded
  let reward: { xpAwarded: number; streak: number; bestStreak: number } | null = null;
  if (grade.correct) {
    const { data, error } = await admin.rpc("record_daily_solve", {
      p_user_id: userId,
      p_tier: ch.difficulty,
      p_hints_used: hintsUsed,
      p_attempt: attemptNo,
    });
    // answer is still correct if this fails, log it so missing XP can be investigated
    if (error) console.error("record_daily_solve failed", error);
    else reward = data;
  }

  // ---- Respond: worked solution is only revealed once solved or out of attempts
  const reveal = grade.correct || attemptsLeft === 0;
  return NextResponse.json({
    correct: grade.correct,
    mistakeTag: grade.mistake_tag,     // useful for analytics + usability testing
    feedback,
    attemptsLeft,
    workedSolution: reveal ? secret.worked_solution : null,
    reward,                            // { xpAwarded, streak, bestStreak } on a correct answer, else null
  });
}