// GET /api/challenge/today?difficulty=1|2|3
// returns user's challenge for today at that tier, generating it on first request
// category is random but seeded by user + date + tier, so refreshing won't reroll
import { NextRequest, NextResponse } from "next/server";
import { buildModuleMcq } from "@/lib/daily_challenges/moduleMcq";
import { FALLBACK_TEXT, writeChallengeText, type Challenge } from "@/lib/daily_challenges/prompts";
import { createAdminClient, createClient, melbourneDate, MODULE_MCQ, PYTHON_TYPES, qiskit, seedFrom } from "@/lib/supabase/server";

// allow up to 60 s: first generation calls Python service and LLM
export const maxDuration = 60;
// columns safe to return to browser (never the answer, which lives in a separate table).
const PUBLIC_COLS = "id,date,type,difficulty,input_kind,prompt_data,options,title,scenario,task,hints";

export async function GET(req: NextRequest) {
  // ---- Authenticate: read the signed in user from their session cookie
  // getUser() verifies the session with Supabase rather than trusting cookie alone
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "sign in required" }, { status: 401 });
  const userId = user.id;
  // admin client for the server only answers table (only after the user is verified)
  const admin = createAdminClient();

  // ---- Validate the requested tier
  const difficulty = Number(req.nextUrl.searchParams.get("difficulty"));
  if (![1, 2, 3].includes(difficulty)) return NextResponse.json({ error: "difficulty must be 1-3" }, { status: 400 });
  const date = melbourneDate();

  // ---- Already generated today for this tier? Return it unchanged
  const existing = await admin.from("daily_challenges").select(PUBLIC_COLS)
    .eq("user_id", userId).eq("date", date).eq("difficulty", difficulty).maybeSingle();
  if (existing.data) return NextResponse.json(existing.data);

  // ---- Pick a random category (deterministic for this user, day and tier)
  const pickSeed = seedFrom(`${userId}:${date}:${difficulty}`);
  const pool: string[] = [...PYTHON_TYPES];
  if (difficulty === 1) pool.push(MODULE_MCQ);            // module questions are tier 1 only
  let type = pool[pickSeed % pool.length];
  // separate seed for generating the challenge itself, so the problem varies by category too
  const seed = seedFrom(`${userId}:${date}:${difficulty}:${type}`);

  // ---- Build challenge
  let ch: Challenge | null = null;
  if (type === MODULE_MCQ) {
    // built here (needs the user's modules) -> returns null if none are eligible.
    ch = await buildModuleMcq(userId, seed);
    if (!ch) type = PYTHON_TYPES[pickSeed % PYTHON_TYPES.length];   // no completed modules/content yet
  }
  // all other category come from Python service
  try {
    ch ??= await qiskit<Challenge>("/challenges/generate", { type, seed, difficulty });
  } catch {
    return NextResponse.json({ error: "challenge service unavailable, try again shortly" }, { status: 503 });
  }

  // ---- have LLM write the title, scenario, task and hints; use templated text if it fails
  let text = FALLBACK_TEXT[type], usedFallback = false;
  try {
    text = await writeChallengeText(ch);
  } catch {
    usedFallback = true;
  }

  // ---- Store public challenge row
  // on conflict do nothing: if two requests race, the first insert wins
  const { data: row } = await admin.from("daily_challenges")
    .upsert({
      user_id: userId, date, type, difficulty, input_kind: ch.input_kind,
      prompt_data: ch.prompt_data, options: ch.options,
      title: text.title, scenario: text.scenario, task: text.task, hints: text.hints,
      used_fallback: usedFallback,
    }, { onConflict: "user_id,date,difficulty", ignoreDuplicates: true })
    .select("id").maybeSingle();

  // ---- Store answer in the server-only table, but only if this request created the row
  if (row) {
    const { error } = await admin.from("daily_challenge_answers").insert({
      challenge_id: row.id, answer: ch.answer, worked_solution: ch.worked_solution,
      leak_terms: ch.leak_terms, seed,
    });
    if (error) return NextResponse.json({ error: "server error" }, { status: 500 });
  }
  // ---- Return the stored public row
  const { data: out } = await admin.from("daily_challenges").select(PUBLIC_COLS)
    .eq("user_id", userId).eq("date", date).eq("difficulty", difficulty).single();
  return NextResponse.json(out);
}
