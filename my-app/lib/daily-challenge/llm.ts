
import OpenAI from "openai";
import { z } from "zod";

// open source LLM client ->  Groq

// LLM variables
export const llm = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,          
  apiKey: process.env.LLM_API_KEY ?? "none",  
  timeout: 30_000,                            // default timeout
});
const MODEL = process.env.LLM_MODEL ?? "openai/gpt-oss-20b";

const JSON_MODE = (process.env.LLM_JSON_MODE ?? "json_schema") as "json_schema" | "json_object";

const REASONING_EFFORT = process.env.LLM_REASONING_EFFORT as "low" | "medium" | "high" | undefined;


// removes json fences that some models wrap around their output
function stripFences(t: string) {
  return t.replace(/```json|```/g, "").trim();
}

// JSON Schema keywords that some providers reject in strict structured-output mode
const UNSUPPORTED_KEYWORDS = new Set(["$schema", "minLength", "maxLength", "minItems", "maxItems", "pattern", "format"]);

// cnvert a Zod schema to a JSON Schema that strict-mode providers accept
export function providerSchema(schema: z.ZodType): Record<string, unknown> {
  const strip = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(strip);
    if (node && typeof node === "object") {
      return Object.fromEntries(
        Object.entries(node as Record<string, unknown>)
          .filter(([k]) => !UNSUPPORTED_KEYWORDS.has(k))
          .map(([k, v]) => [k, strip(v)]),
      );
    }
    return node;
  };
  return strip(z.toJSONSchema(schema)) as Record<string, unknown>;
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
        // on retry, tell model why last output was rejected
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
       // a provider 429 means the shared quota is used up
      if (e instanceof OpenAI.APIError && e.status === 429) throw new Error("LLM provider rate limit reached");
      // keep error short, it's sent back to model on the next attempt
      lastError = e instanceof Error ? e.message.slice(0, 200) : "invalid JSON";
    }
  }
  throw new Error(`LLM output failed validation: ${lastError}`);
}


// checks for answer leaks
export function leaks(text: string, leakTerms: string[]): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");
  const t = norm(text);
  return leakTerms.some((term) => {
    if (!term || term.trim().length < 2) return false;
    if (/^[A-Za-z]+$/.test(term)) return new RegExp(`\\b${term}\\b`).test(text);
    return t.includes(norm(term));
  });
}