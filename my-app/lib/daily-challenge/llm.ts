
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

const configuredEffort = process.env.LLM_REASONING_EFFORT;
const REASONING_EFFORT = configuredEffort === "low" || configuredEffort === "medium" || configuredEffort === "high"
  ? configuredEffort : undefined;


// removes json fences that some models wrap around their output
function stripFences(t: string) {
  return t.replace(/```json|```/g, "").trim();
}

// JSON Schema keywords that some providers reject in strict structured-output mode
const UNSUPPORTED_KEYWORDS = new Set(["$schema", "minLength", "maxLength", "minItems", "maxItems", "pattern", "format"]);

// Schema maps contain user-defined names, which must not be treated as keywords.
const SCHEMA_MAPS = new Set(["properties", "$defs", "definitions", "patternProperties", "dependentSchemas"]);

// Convert a Zod schema to a provider-compatible subset; local Zod checks remain authoritative.
export function providerSchema(schema: z.ZodType): Record<string, unknown> {
  const strip = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(strip);
    if (node && typeof node === "object") {
      return Object.fromEntries(
        Object.entries(node as Record<string, unknown>)
          .filter(([k]) => !UNSUPPORTED_KEYWORDS.has(k))
          .map(([k, v]) => [k, SCHEMA_MAPS.has(k) && v && typeof v === "object"
            ? Object.fromEntries(Object.entries(v).map(([name, child]) => [name, strip(child)]))
            : ["const", "enum", "default", "examples"].includes(k) ? v : strip(v)]),
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
  deadlineAt?: number;                         // absolute deadline shared across the route's LLM jobs
}): Promise<T> {
  const { system, user, schema, check, temperature = 0.4, retries = 2, timeoutMs = 30_000,
    deadlineAt = Date.now() + 20_000 } = opts;
  if (!Number.isFinite(deadlineAt) || !Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error("Invalid LLM time budget");
  }
  const responseFormat: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming["response_format"] =
    JSON_MODE === "json_schema"
      ? { type: "json_schema", json_schema: { name: "output", schema: providerSchema(schema), strict: true } }
      : { type: "json_object" };
  let lastError = "";

  for (let attempt = 0; attempt <= retries; attempt++) {
    const remaining = Math.floor(deadlineAt - Date.now());
    if (remaining <= 0) throw new Error("LLM deadline exceeded");
    const attemptTimeout = Math.min(timeoutMs, remaining);
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const expired = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new Error("LLM deadline exceeded"));
      }, attemptTimeout);
    });

    const request: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
      model: MODEL,
      temperature,
      ...(REASONING_EFFORT ? { reasoning_effort: REASONING_EFFORT } : {}),
      messages: [
        { role: "system" as const, content: system },
        // on retry, tell model why last output was rejected
        { role: "user" as const, content: lastError ? `${user}\n\nYour previous output was rejected: ${lastError}. Fix it.` : user },
      ],
      // ask provider to keep outputs to JSON only
      response_format: responseFormat,
    };
    let res;
    try {
      // Disable SDK retries: every attempt must fit the same remaining budget.
      res = await Promise.race([
        llm.chat.completions.create(request, { timeout: attemptTimeout, maxRetries: 0, signal: controller.signal }),
        expired,
      ]);
    } catch (e) {
      if (e instanceof OpenAI.APIError && e.status === 429) throw new Error("LLM provider rate limit reached");
      throw e;
    } finally {
      clearTimeout(timer);
    }
    if (Date.now() >= deadlineAt) throw new Error("LLM deadline exceeded");

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


// Detect listed answer representations, including common spelling variants.
// This is a guard, not a guarantee against arbitrary paraphrases or semantic leaks.
export function leaks(text: string, leakTerms: string[]): boolean {
  const percentages = (s: string) => s.replace(/\b(\d+(?:\.\d+)?)\s*(?:percent|per\s+cent)\b/gi, "$1%");
  const norm = (s: string) => percentages(s).toLowerCase().replace(/\s+/g, "");
  const t = norm(text);
  return leakTerms.some((rawTerm) => {
    const term = rawTerm.trim();
    if (!term) return false;
    if (term.length === 1) {
      // Single letters/gate names are common teaching text. Block explicit answer
      // claims without rejecting every legitimate mention of the same character.
      if (!/^[a-z0-9]$/i.test(term)) return false;
      return new RegExp(`\\b(?:answer|word|option|gate|key|bit)\\s*(?:is|=|:)\\s*["'\u0060]?${term}\\b`, "i").test(text);
    }
    if (/^[A-Za-z]+$/.test(term)) return new RegExp(`\\b${term}\\b`, "i").test(text);
    return t.includes(norm(term));
  });
}
