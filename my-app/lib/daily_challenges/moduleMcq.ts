
import { writeModuleMcq, type Challenge } from "./prompts";
import { createAdminClient, seededRandom } from "@/lib/supabase/server";

// builds module_mcq challenge in same shape the Python service returns so it is treated the same as other categories

/** Returns null if user has no completed module with content (category is skipped) */
export async function buildModuleMcq(userId: string, seed: number): Promise<Challenge | null> {
  const admin = createAdminClient();   // reads module data and server only question pool
  // modules user has completed
  const { data: done } = await admin.from("module_progress")
    .select("module_id").eq("user_id", userId).eq("completed", true);
  if (!done?.length) return null;

  // seeded randomness, so the same user, day and tier always get the same question
  const rand = seededRandom(seed);
  // picks one completed module, then load its content chunks
  const moduleId = done[Math.floor(rand() * done.length)].module_id;
  const { data: chunks } = await admin.from("module_chunks")
    .select("content").eq("module_id", moduleId);

  // question is from LLM if possible, otherwise from human written pool
  let q: { question: string; options: string[]; correct_index: number; explanation: string; supporting_quote?: string } | null = null;
  // try LLM first -> one random chunk of module text becomes one question
  if (chunks?.length) {
    try {
      q = await writeModuleMcq(chunks[Math.floor(rand() * chunks.length)].content);
    } catch { /* fall through to the human written pool */ }
  }
  // Fallback: human written question for the same module
  if (!q) {
    const { data: pool } = await admin.from("question_pool")
      .select("question,options,correct_index,explanation").eq("module_id", moduleId);
    if (!pool?.length) return null;   // nothing available? Caller picks another category
    q = pool[Math.floor(rand() * pool.length)];
  }

  // shuffle options
  // `order` lists original option indexes in new positions
  const order = q.options.map((_, i) => i).sort(() => rand() - 0.5);
  const ids = ["a", "b", "c", "d"];
  const options = order.map((orig, i) => ({ id: ids[i], display: q!.options[orig] }));
  // find where correct option ended up, and record new id
  const correctId = ids[order.indexOf(q.correct_index)];
  // show supporting quote in worked solution so users can see where answer comes from
  const quote = q.supporting_quote ? `\n\nFrom the module: "${q.supporting_quote}"` : "";

  // same shape as a Python generated challenge, so storage and grading work the same way
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

/** grade module question */
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
