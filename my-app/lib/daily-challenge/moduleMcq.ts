
import { writeModuleMcq, type Challenge } from "./prompts";
import { createAdminClient, seededRandom } from "@/lib/supabase/server";

// builds module_mcq challenge in same shape the Python service returns
const MAX_PASSAGE_CHARS = 6000;

type Mcq = { question: string; options: string[]; correct_index: number; explanation: string; supporting_quote?: string };

// returns null if user has no completed module
export async function buildModuleMcq(userId: string, seed: number, useLlm = true): Promise<Challenge | null> {
  const admin = createAdminClient();   // reads module data and server only question pool
  // modules user has completed
  const { data: progress, error } = await admin.from("module_progress")
    .select("module_id").eq("user_id", userId).eq("quiz_passed", true);
  if (error) console.error("[daily-challenge] module_mcq: reading module_progress failed:", error.code, error.message);
  if (!progress?.length) return null;

  // keep only modules that are published
  const { data: published } = await admin.from("modules")
    .select("id").in("id", progress.map((p) => p.module_id)).eq("is_published", true);
  const moduleIds = (published ?? []).map((m) => m.id as string).sort();   // sorted: stable order for the seed
  if (!moduleIds.length) return null;

  // seeded randomness, so the same user, day and tier always get same question
  const rand = seededRandom(seed);
  const moduleId = moduleIds[Math.floor(rand() * moduleIds.length)];


  // question is from LLM if possible, otherwise from human written pool
  let q: Mcq | null = null;
  // try LLM first -> one random chunk of module text becomes one question
   if (useLlm) {
    const { data: pages } = await admin.from("module_pages")
      .select("body").eq("module_id", moduleId).order("position");
    const usable = (pages ?? []).filter((p) => (p.body ?? "").trim().length >= 200);
    if (usable.length) {
      const body: string = usable[Math.floor(rand() * usable.length)].body;
      try {
        q = await writeModuleMcq(body.slice(0, MAX_PASSAGE_CHARS));
      } catch { /* fall through to the module's test questions */ }
    }
  }
  
 // fallback: a question from module's end-of-module test
  if (!q) {
    const { data: questions } = await admin.from("quiz_questions")
      .select("id,prompt,options,explanation,answer_keys(correct_index)")
      .eq("module_id", moduleId).order("position");
    const pool = (questions ?? []).flatMap((row) => {
      const key = Array.isArray(row.answer_keys) ? row.answer_keys[0] : row.answer_keys;
      const options = Array.isArray(row.options) ? row.options.map(String) : [];
      const correct = key?.correct_index;
      if (typeof correct !== "number" || correct < 0 || correct >= options.length || options.length < 2) return [];
      return [{
        question: row.prompt as string,
        options,
        correct_index: correct,
        explanation: (row.explanation as string | null) ?? "That's the answer the module's test expects.",
      }];
    });
    if (!pool.length) return null;   // nothing usable: the caller picks another category
    q = pool[Math.floor(rand() * pool.length)];
  }

  // shuffle options
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const ids = "abcdefgh".split("");
  const options = order.map((orig, i) => ({ id: ids[i], display: q!.options[orig] }));
  // find where the correct option ended up, and record its new id
  const correctId = ids[order.indexOf(q.correct_index)];
  // show supporting quote in worked solution so users can see where answer comes from
  const quote = q.supporting_quote ? `\n\nFrom the module: "${q.supporting_quote}"` : "";

  // same shape as Python generated challenge, so storage and grading work in same way
  // correct option text is a leak term, so hints can't give it away
  return {
    type: "module_mcq",
    difficulty: 1,
    seed,
    input_kind: "multiple_choice",
    prompt_data: { task: "module_question", module_id: moduleId, question: q.question },
    answer: { correct_option: correctId, explanation: q.explanation },
    options,
    worked_solution: `${q.explanation}${quote}`,
    leak_terms: [q.options[q.correct_index]],
  };
}

// grade module question
export function gradeModuleMcq(answer: Record<string, unknown>, submission: Record<string, unknown>) {
  const correct = submission.option_id === answer.correct_option;
  return {
    correct,
    mistake_tag: correct ? null : "wrong_option",
    explanation: correct
      ? "Correct: that matches what the module explains."
      : "Not quite. Think back to how the module explained this, and rule out options that contradict it.",
  };
}
