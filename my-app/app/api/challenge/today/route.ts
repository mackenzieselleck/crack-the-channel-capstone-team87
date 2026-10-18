// GET /api/challenge/today?difficulty=1|2|3
// Returns the user's challenge for today at that tier (generating it on first request) plus
// their progress on it. The category is random but seeded by user + date + tier, so
// refreshing can't re-roll it. Hints are NOT included here: they're revealed one at a time
// through POST /api/challenge/hint so the XP penalty is tracked on the server (ADR 018).
import { NextRequest, NextResponse } from "next/server";
import { buildModuleMcq } from "@/lib/daily-challenge/moduleMcq";
import { FALLBACK_TEXT, writeChallengeText, type Challenge } from "@/lib/daily-challenge/prompts";
import { createAdminClient, createClient, melbourneDate, MODULE_MCQ, PYTHON_TYPES, qiskit, seedFrom } from "@/lib/supabase/server";
import { limitRoute, llmAllowed } from "@/lib/daily-challenge/rateLimit";
import { loadProgress, PUBLIC_COLS } from "@/lib/daily-challenge/progress";
import type { PublicChallenge, TodayResponse } from "@/lib/daily-challenge/types";

// Allow up to 60 s: first generation calls the Python service and the LLM.
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // ---- Authenticate: read the signed-in user from their session cookie.
  // getUser() verifies the session with Supabase rather than trusting the cookie alone.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "sign in required" }, { status: 401 });
  const userId = user.id;
  const limited = await limitRoute(userId, "today");
  if (limited) return limited;
  // Admin client for the server-only tables (only after the user is verified).
  const admin = createAdminClient();

  // ---- Validate the requested tier.
  const difficulty = Number(req.nextUrl.searchParams.get("difficulty"));
  if (![1, 2, 3].includes(difficulty)) return NextResponse.json({ error: "difficulty must be 1-3" }, { status: 400 });
  const date = melbourneDate();

  // ---- Already generated today for this tier? Return it with the user's progress.
  const existing = await findRow(admin, userId, date, difficulty);
  if (existing) return respond(admin, userId, existing);

  // ---- Pick a random category (deterministic for this user, day and tier).
  const pickSeed = seedFrom(`${userId}:${date}:${difficulty}`);
  const pool: string[] = [...PYTHON_TYPES];
  if (difficulty === 1) pool.push(MODULE_MCQ);            // module questions are tier 1 only
  let type = pool[pickSeed % pool.length];
  // Separate seed for generating the challenge itself, so the problem varies by category too.
  const seed = seedFrom(`${userId}:${date}:${difficulty}:${type}`);

  // ---- Build the challenge.
  let ch: Challenge | null = null;
  if (type === MODULE_MCQ) {
    // Built here (needs the user's modules); returns null if none are eligible.
    ch = await buildModuleMcq(userId, seed, await llmAllowed(userId));
    if (!ch) type = PYTHON_TYPES[pickSeed % PYTHON_TYPES.length];   // no completed modules/content yet
  }
  // Every other category comes from the Python service (only called if `ch` is still null).
  try {
    ch ??= await qiskit<Challenge>("/challenges/generate", { type, seed, difficulty });
  } catch {
    return NextResponse.json({ error: "The challenge service is waking up. Try again in a moment." }, { status: 503 });
  }

  // ---- Have the LLM write the title, scenario, task and hints; use templated text if it
  // fails or the LLM budget is used up.
  let text = FALLBACK_TEXT[type], usedFallback = true;
  if (await llmAllowed(userId)) {
    const started = Date.now();
    try {
      text = await writeChallengeText(ch);
      usedFallback = false;
    } catch (e) {
      console.warn("[daily-challenge] challenge text fell back:", e instanceof Error ? e.message : e);
    }
    console.info(`[daily-challenge] challenge text took ${Date.now() - started} ms (fallback: ${usedFallback})`);
  } else {
    console.info("[daily-challenge] LLM budget used up: using fallback text");
  }

  // ---- Store the public challenge row.
  // On conflict do nothing: if two requests race, the first insert wins and we return it.
  const { data: row, error: storeError } = await admin.from("daily_challenges")
    .upsert({
      user_id: userId, date, type, difficulty, input_kind: ch.input_kind,
      prompt_data: ch.prompt_data, options: ch.options,
      title: text.title, scenario: text.scenario, task: text.task, hints: text.hints,
      used_fallback: usedFallback,
    }, { onConflict: "user_id,date,difficulty", ignoreDuplicates: true })
    .select("id").maybeSingle();
  if (storeError) {
    console.error("[daily-challenge] storing challenge failed:", storeError.code, storeError.message);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }

  // ---- Store the answer in the server-only table, but only if this request created the row.
  if (row) {
    const { error } = await admin.from("daily_challenge_answers").insert({
      challenge_id: row.id, answer: ch.answer, worked_solution: ch.worked_solution,
      leak_terms: ch.leak_terms, seed,
    });
    if (error) {
      console.error("[daily-challenge] storing answer failed:", error.code, error.message);
      // Remove the half-stored challenge so the user isn't stuck with an ungradeable tier.
      await admin.from("daily_challenges").delete().eq("id", row.id);
      return NextResponse.json({ error: "server error" }, { status: 500 });
    }
  }
  // ---- Return the stored row (whichever request created it).
  const stored = await findRow(admin, userId, date, difficulty);
  if (!stored) {
    console.error("[daily-challenge] challenge was stored but could not be read back");
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
  return respond(admin, userId, stored);
}

type Row = PublicChallenge & { hints: string[]; hints_revealed: number };
type Admin = ReturnType<typeof createAdminClient>;

async function findRow(admin: Admin, userId: string, date: string, difficulty: number): Promise<Row | null> {
  const { data, error } = await admin.from("daily_challenges")
    .select(`${PUBLIC_COLS},hints,hints_revealed`)
    .eq("user_id", userId).eq("date", date).eq("difficulty", difficulty).maybeSingle();
  if (error) console.error("[daily-challenge] reading challenge failed:", error.code, error.message);
  return (data as Row | null) ?? null;
}

async function respond(admin: Admin, userId: string, row: Row) {
  const { hints, hints_revealed, ...challenge } = row;
  const progress = await loadProgress(admin, userId, row.id, hints ?? [], hints_revealed ?? 0);
  return NextResponse.json({ challenge, progress } satisfies TodayResponse);
}