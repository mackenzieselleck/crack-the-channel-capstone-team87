
// cheap summary of today's three tiers and user's streak and XP for challenge hub
import { NextResponse } from "next/server";
import { createAdminClient, createClient, MAX_ATTEMPTS, melbourneDate } from "@/lib/supabase/server";
import { limitRoute } from "@/lib/daily-challenge/rateLimit";
import { loadStreak } from "@/lib/daily-challenge/progress";
import type { ChallengeType, Difficulty, StatusResponse, TierStatus } from "@/lib/daily-challenge/types";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "sign in required" }, { status: 401 });
  const limited = await limitRoute(user.id, "status");
  if (limited) return limited;
  const admin = createAdminClient();
  const date = melbourneDate();

  const { data: challenges } = await admin.from("daily_challenges")
    .select("id,difficulty,title,type").eq("user_id", user.id).eq("date", date);
  const ids = (challenges ?? []).map((c) => c.id);
  const { data: attempts } = ids.length
    ? await admin.from("challenge_attempts").select("challenge_id,correct").eq("user_id", user.id).in("challenge_id", ids)
    : { data: [] as { challenge_id: string; correct: boolean }[] };

  const tiers: TierStatus[] = ([1, 2, 3] as Difficulty[]).map((difficulty) => {
    const c = challenges?.find((x) => x.difficulty === difficulty);
    const mine = (attempts ?? []).filter((a) => a.challenge_id === c?.id);
    const solved = mine.some((a) => a.correct);
    return {
      difficulty,
      started: !!c,
      solved,
      attemptsUsed: mine.length,
      attemptsLeft: solved ? 0 : MAX_ATTEMPTS - mine.length,
      title: c?.title ?? null,
      type: (c?.type as ChallengeType | undefined) ?? null,
    };
  });

  const body: StatusResponse = {
    date,
    completedToday: tiers.some((t) => t.solved),
    tiers,
    streak: await loadStreak(admin, user.id, date),
  };
  return NextResponse.json(body, { headers: { "Cache-Control": "private, no-store" } });
}
