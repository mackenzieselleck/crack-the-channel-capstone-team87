
import { z } from "zod";
import { leaks, llmJson } from "./llm";

// prompts and output schemas for all three jobs the LLM is trusted to do:
// 1. write the challenge text, 2. rephrase feedback, 3. write module multiple choice questions
// LLM never computes or grades answers


// mirrors Python Challenge dataclass
export type Challenge = {
  type: string;
  difficulty: 1 | 2 | 3;
  seed: number;
  input_kind: string;
  prompt_data: Record<string, unknown>;
  answer: Record<string, unknown>;
  options: { id: string; display: string }[];
  worked_solution: string;
  leak_terms: string[];
};

// ---------- write challenge text  ----------
// LLM's challenge text must match object shape. Length limits will keep text short and stop runaway output
export const ChallengeText = z.object({
  title: z.string().min(3).max(60),
  scenario: z.string().min(20).max(500),   // short story framing
  task: z.string().min(10).max(250),        // exactly what the user needs to do for task
  hints: z.array(z.string().min(5).max(250)).length(3),  // progressively more helpful
});
export type ChallengeText = z.infer<typeof ChallengeText>;

// instructions for writing challenge textprovided to LLM 
// key rules: never reveal answer and never restate numbers
const WRITER_SYSTEM = `You write the text for a daily challenge on a quantum key distribution learning site for complete beginners (first year cyber security students, no quantum background).

You receive structured challenge data. The site displays all numbers, bits, tables, states and matrices itself, so:
- NEVER compute, state or hint at the final answer.
- NEVER restate or change any number, bit string, matrix or state from the data. Refer to them ("the table below", "the state shown").
- Plain language, friendly, no jargon without a short explanation. Alice, Bob and Eve are the characters involved.
- title: max 6 words. scenario: 1-3 sentences of story. task: 1-2 sentences saying exactly what to submit.
- hints: exactly 3. Hint 1 names the concept. Hint 2 describes the method. Hint 3 walks through the first step only.
Respond with JSON only: {"title","scenario","task","hints"}.`;

// runs while user waits, needs to be kept fast: one retry, short timeout, then fallback text
export async function writeChallengeText(ch: Challenge): Promise<ChallengeText> {
  // LLM gets public data only: no answer or worked solution
  const publicData = { type: ch.type, difficulty: ch.difficulty, input_kind: ch.input_kind,
                       prompt_data: ch.prompt_data, options: ch.options };
  return llmJson({
    system: WRITER_SYSTEM,
    user: JSON.stringify(publicData),
    schema: ChallengeText,
    retries: 1,
    timeoutMs: 12_000,
    // reject (and retry) if any text contains an answer string supplied by generator
    check: (out) =>
      leaks([out.scenario, out.task, ...out.hints].join(" "), ch.leak_terms)
        ? "the text reveals the answer; remove it" : null,
  });
}

// templated text used if  LLM is down, slow, or keeps failing validation
// 1 entry per category, so a challenge can always be shown
export const FALLBACK_TEXT: Record<string, ChallengeText> = {
  bb84_eve: { title: "Is Eve listening?", scenario: "Alice and Bob have compared part of their key.",
    task: "Use the data below to answer the question.",
    hints: ["Eavesdropping causes errors.", "QBER = mismatches ÷ sifted bits.", "Count the rows where the bits differ."] },
  sifting: { title: "Sift the key", scenario: "Alice sent qubits to Bob; now they compare bases.",
    task: "Work out the requested key or message.",
    hints: ["Only matching bases are kept.", "Go row by row comparing bases.", "Round 1: do the bases match?"] },
  state_evolution: { title: "Where does the state go?", scenario: "A gate acts on a qubit state.",
    task: "Find the state after the gates.",
    hints: ["Gates are matrices.", "Multiply the matrix by the state vector.", "Write the start state as a column vector."] },
  normalisation: { title: "Make it add up", scenario: "Every valid quantum state has total probability 1.",
    task: "Answer the question about the state shown.",
    hints: ["Probability = |amplitude|².", "Squared magnitudes must sum to 1.", "Square each amplitude first."] },
  gate_simplification: { title: "Fewer gates, same job", scenario: "This circuit is longer than it needs to be.",
    task: "Find the simplest equivalent.",
    hints: ["Some gates cancel.", "Look for HH or HXH patterns.", "Start from the left and look for pairs."] },
  module_mcq: { title: "Module check-in", scenario: "A quick question from a module you've finished.",
    task: "Pick the correct answer.", hints: ["Think back to the module.", "Rule out options that contradict it.", "Which option matches the module's wording?"] },
};

// ---------- feedback after submission ----------
// Shape of the LLM's feedback output
export const Feedback = z.object({ message: z.string().min(10).max(600) });

// instructions for feedback
// grader's explanation is the source of truth the LLM only makes it friendlier and can't add facts or reveal the answer while attempts remain
const FEEDBACK_SYSTEM = `You give short feedback on a beginner's answer to a quantum cryptography challenge.
You receive: whether they were correct, a mistake tag and an EXPLANATION written by the grader. The explanation is authoritative.
- Rephrase the explanation warmly in 2-4 sentences. Do not add new technical claims, numbers or formulas.
- If incorrect and attempts remain, do NOT reveal the answer; point them at the misconception.
- If correct, briefly say why their method works and connect it to how QKD stays secure when relevant.
JSON only: {"message"}.`;

/** Rephrase grader's explanation as friendly feedback. Never throws: falls back to the explanation. */
export async function writeFeedback(args: {
  type: string; correct: boolean; mistake_tag: string | null; explanation: string;
  attemptsLeft: number; leakTerms: string[];
}): Promise<string> {
  try {
    const out = await llmJson({
      system: FEEDBACK_SYSTEM,
      user: JSON.stringify(args),
      schema: Feedback,
      temperature: 0.3,
      retries: 1,
      // only block answer leaks while the user can still try again
      check: (o) => (!args.correct && args.attemptsLeft > 0 && leaks(o.message, args.leakTerms))
        ? "the message reveals the answer" : null,
    });
    return out.message;
  } catch {
    return args.explanation;   // grader's text is always the fallback
  }
}

// ---------- multiple choice from finished module (module_mcq category) ----------
// shape of an LLM-written module question: four options, the index of the correct one, a quote proving the answer, and an explanation shown after answering
export const ModuleMcq = z.object({
  question: z.string().min(10).max(300),
  options: z.array(z.string().min(1).max(150)).length(4),
  correct_index: z.number().int().min(0).max(3),
  supporting_quote: z.string().min(10).max(400),   // must appear verbatim in the passage
  explanation: z.string().min(10).max(400),
});
export type ModuleMcq = z.infer<typeof ModuleMcq>;

// instructions for writing a module question from a single passage only
const MCQ_SYSTEM = `You write ONE multiple choice question for beginners using ONLY the passage provided.
- The correct answer must be directly supported by the passage. Copy the supporting sentence EXACTLY into supporting_quote.
- 3 distractors that reflect realistic beginner misconceptions, similar length to the correct option, not joke answers.
- No "all of the above" / "none of the above".
JSON only: {"question","options","correct_index","supporting_quote","explanation"}.`;

// normalises text for comparison: lower case, single spaces, trimmed
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/**
 * write a multiple choice question from passage of module text, with two checks:
 *   1. supporting quote must appear word for word in passage, and options must be distinct
 *   2. a second, independent call must pick the same correct answer
 * throws if either check fails, so the caller can use a human written question instead
 */
export async function writeModuleMcq(passage: string): Promise<ModuleMcq> {
  const mcq = await llmJson({
    system: MCQ_SYSTEM,
    user: `PASSAGE:\n${passage}`,
    schema: ModuleMcq,
    retries: 1,
    timeoutMs: 15_000,
    check: (o) =>
      !norm(passage).includes(norm(o.supporting_quote)) ? "supporting_quote is not an exact quote from the passage"
      : new Set(o.options.map(norm)).size !== 4 ? "options must be distinct" : null,
  });
  // independent check: can the model answer its own question from the passage?
  const verify = await llmJson({
    system: "Answer the multiple choice question using ONLY the passage. JSON only: {\"index\": 0-3}.",
    user: `PASSAGE:\n${passage}\n\nQUESTION: ${mcq.question}\nOPTIONS: ${JSON.stringify(mcq.options)}`,
    schema: z.object({ index: z.number().int().min(0).max(3) }),
    temperature: 0,
    retries: 0,
    timeoutMs: 10_000,
  });
  // if independent answer disagrees, the question is probably ambiguous or wrong
  if (verify.index !== mcq.correct_index) throw new Error("MCQ failed self-consistency check");
  return mcq;
}
