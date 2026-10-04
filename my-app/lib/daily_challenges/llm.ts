
import OpenAI from "openai";
import { z } from "zod";

// open source LLM client -> any OpenAI compatible endpoint will work

// LLM variables
export const llm = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,          
  apiKey: process.env.LLM_API_KEY ?? "none",  
  timeout: 30_000,                            // default timeout
});
const MODEL = process.env.LLM_MODEL!;
// requesting JSON output (dependent on what LLM we choose)
// "json_schema" if the provider supports structured outputs (vLLM, most hosts)
// "json_object" as fallback. Zod validation below runs either way
const JSON_MODE = (process.env.LLM_JSON_MODE ?? "json_schema") as "json_schema" | "json_object";

/** removes ```json fences that some models wrap around their output. */
function stripFences(t: string) {
  return t.replace(/```json|```/g, "").trim();
}


// asks LLM for JSON, validates with Zod schema, and retries on failure
// throws if attempts fail
export async function llmJson<T>(opts: {
  system: string;                              // instructions for model
  user: string;                                // data for request
  schema: z.ZodType<T>;                        // the shape the output must match
  check?: (out: T) => string | null;           // extra validation, returns an error string to retry
  temperature?: number;                        // lower = more predictable output
  retries?: number;                            // extra attempts after the first
  timeoutMs?: number;                          // per attempt
}): Promise<T> {
  const { system, user, schema, check, temperature = 0.4, retries = 2, timeoutMs = 30_000 } = opts;
  let lastError = "";

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await llm.chat.completions.create({
      model: MODEL,
      temperature,
      messages: [
        { role: "system", content: system },
        // on retry, tell the model why its last output was rejected so it can be fixed
        { role: "user", content: lastError ? `${user}\n\nYour previous output was rejected: ${lastError}. Fix it.` : user },
      ],
      // ask provider to keep outputs to JSON only
      response_format:
        JSON_MODE === "json_schema"
          ? { type: "json_schema", json_schema: { name: "output", schema: z.toJSONSchema(schema) as Record<string, unknown>, strict: true } }
          : { type: "json_object" },
    // maxRetries: 0 because this function handles retries itself
    }, { timeout: timeoutMs, maxRetries: 0 });

    const text = res.choices[0]?.message?.content ?? "";
    try {
      // parse JSON and check it matches schema
      const parsed = schema.parse(JSON.parse(stripFences(text)));
      // run any extra checks
      const problem = check?.(parsed) ?? null;
      if (!problem) return parsed;
      lastError = problem;
    } catch (e) {
      // keep error short, it's sent back to model on the next attempt
      lastError = e instanceof Error ? e.message.slice(0, 200) : "invalid JSON";
    }
  }
  throw new Error(`LLM output failed validation: ${lastError}`);
}

/**
 * true if any answer string appears in text
 * case and whitespace are ignored, so "Key" and "K E Y" both match "KEY".
 * terms shorter than 2 characters are skipped to avoid false matches
 */
export function leaks(text: string, leakTerms: string[]): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");
  const t = norm(text);
  return leakTerms.some((term) => term && norm(term).length >= 2 && t.includes(norm(term)));
}
