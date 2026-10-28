import OpenAI from 'openai';
import { z } from 'zod';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function response(content: string): OpenAI.Chat.Completions.ChatCompletion {
  return {
    id: 'controlled-response', object: 'chat.completion', created: 0, model: 'qa',
    choices: [{ index: 0, finish_reason: 'stop', logprobs: null,
      message: { role: 'assistant', content, refusal: null } }],
  };
}

const schema = z.object({ message: z.string().min(10).max(60) });
const valid = response('{"message":"A valid response."}');
const options = { system: 'Return JSON.', user: 'Describe the method.', schema, retries: 1 };

// These spies exercise the SDK's promise boundary without making HTTP requests.
function sdkPromise(promise: Promise<OpenAI.Chat.Completions.ChatCompletion>) {
  return promise as ReturnType<OpenAI['chat']['completions']['create']>;
}

function spyCreate(llm: OpenAI) {
  return vi.spyOn(llm.chat.completions, 'create')
    .mockRejectedValue(new Error('Unexpected provider call'));
}
beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('LLM_REASONING_EFFORT', '');
  vi.stubEnv('LLM_JSON_MODE', 'json_schema');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe('provider schema and request configuration', () => {
  it('sends the compatible schema and retains independent local bounds', async () => {
    const { llm, llmJson } = await import('./llm');
    const create = spyCreate(llm)
      .mockResolvedValueOnce(response('{"message":"tiny"}'))
      .mockResolvedValueOnce(valid);

    await expect(llmJson(options)).resolves.toEqual({ message: 'A valid response.' });
    expect(create).toHaveBeenCalledTimes(2);
    const format = create.mock.calls[0][0].response_format;
    expect(format?.type).toBe('json_schema');
    if (format?.type !== 'json_schema') throw new Error('Expected JSON schema');
    const sent = JSON.stringify(format.json_schema.schema);
    expect(sent).not.toContain('minLength');
    expect(sent).not.toContain('maxLength');
    expect(create.mock.calls[1][0].messages[1].content).toContain('previous output was rejected');
    expect(create.mock.calls[0][1]).toMatchObject({ maxRetries: 0 });
  });

  it('retains array-length validation after removing provider constraints', async () => {
    const { llm, llmJson } = await import('./llm');
    const create = spyCreate(llm)
      .mockResolvedValue(response('{"items":["only one"]}'));
    await expect(llmJson({ ...options, schema: z.object({ items: z.array(z.string()).length(3) }) }))
      .rejects.toThrow('LLM output failed validation');
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('does not strip user-defined property names that happen to be schema keywords', async () => {
    const { providerSchema } = await import('./llm');
    const result = providerSchema(z.object({
      minLength: z.string().min(2),
      pattern: z.object({ maxItems: z.array(z.string()).max(2) }),
    }));
    expect(result).toMatchObject({ properties: {
      minLength: { type: 'string' },
      pattern: { properties: { maxItems: { type: 'array', items: { type: 'string' } } } },
    } });
    expect((result.properties as Record<string, unknown>).minLength).not.toHaveProperty('minLength');
  });

  it.each(['low', 'medium', 'high'])('passes explicitly configured reasoning effort %s', async (effort) => {
    vi.stubEnv('LLM_REASONING_EFFORT', effort);
    const { llm, llmJson } = await import('./llm');
    const create = spyCreate(llm).mockResolvedValue(valid);
    await llmJson(options);
    expect(create.mock.calls[0][0]).toHaveProperty('reasoning_effort', effort);
  });

  it('omits invalid reasoning configuration instead of sending an unsupported value', async () => {
    vi.stubEnv('LLM_REASONING_EFFORT', 'anything');
    const { llm, llmJson } = await import('./llm');
    const create = spyCreate(llm).mockResolvedValue(valid);
    await llmJson(options);
    expect(create.mock.calls[0][0]).not.toHaveProperty('reasoning_effort');
  });

  it('preserves JSON-object mode and accepts fenced JSON', async () => {
    vi.stubEnv('LLM_JSON_MODE', 'json_object');
    const { llm, llmJson } = await import('./llm');
    const create = spyCreate(llm)
      .mockResolvedValue(response('```json\n{"message":"A valid response."}\n```'));
    await expect(llmJson(options)).resolves.toEqual({ message: 'A valid response.' });
    expect(create.mock.calls[0][0].response_format).toEqual({ type: 'json_object' });
  });
});

describe('shared time budget', () => {
  it('does not start a request after its workflow deadline', async () => {
    const { llm, llmJson } = await import('./llm');
    const create = spyCreate(llm);
    await expect(llmJson({ ...options, deadlineAt: Date.now() - 1 })).rejects.toThrow('deadline exceeded');
    expect(create).not.toHaveBeenCalled();
  });

  it('clamps successive attempts to the remaining shared deadline', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const { llm, llmJson } = await import('./llm');
    const create = spyCreate(llm)
      .mockImplementationOnce(() => {
        vi.setSystemTime(4_000);
        return sdkPromise(Promise.resolve(response('not JSON')));
      })
      .mockResolvedValueOnce(valid);
    await llmJson({ ...options, timeoutMs: 10_000, deadlineAt: 6_000 });
    expect(create.mock.calls[0][1]?.timeout).toBe(6_000);
    expect(create.mock.calls[1][1]?.timeout).toBe(2_000);
  });

  it('does not launch another validation retry once the shared deadline is consumed', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const { llm, llmJson } = await import('./llm');
    const create = spyCreate(llm).mockImplementationOnce(() => {
      vi.setSystemTime(2_000);
      return sdkPromise(Promise.resolve(response('not JSON')));
    });
    await expect(llmJson({ ...options, deadlineAt: 2_000 })).rejects.toThrow('deadline exceeded');
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('aborts a stalled SDK call and rejects within the default total budget', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const { llm, llmJson } = await import('./llm');
    const create = spyCreate(llm).mockImplementation(() => sdkPromise(new Promise(() => {})));
    const result = expect(llmJson(options)).rejects.toThrow('deadline exceeded');
    expect(create.mock.calls[0][1]?.timeout).toBe(20_000);
    await vi.advanceTimersByTimeAsync(20_000);
    await result;
    expect(create.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('uses a shorter per-attempt timeout when requested', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const { llm, llmJson } = await import('./llm');
    const create = spyCreate(llm).mockImplementation(() => sdkPromise(new Promise(() => {})));
    const result = expect(llmJson({ ...options, timeoutMs: 500, deadlineAt: 40_000 })).rejects.toThrow('deadline exceeded');
    await vi.advanceTimersByTimeAsync(500);
    await result;
    expect(create.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });

  it('propagates provider errors immediately for the caller fallback and clears its timer', async () => {
    vi.useFakeTimers();
    const { llm, llmJson } = await import('./llm');
    const create = spyCreate(llm).mockRejectedValue(new Error('provider unavailable'));
    await expect(llmJson(options)).rejects.toThrow('provider unavailable');
    expect(create).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('answer leak checks', () => {
  it.each([
    ['The word is SECRET.', ['secret']],
    ['The word is secret.', ['SECRET']],
    ['The key is 1 0 1 1 0 1.', ['101101']],
    ['The rate is 25 percent.', ['25%']],
    ['The rate is 25 PER CENT.', ['25%']],
    ['The rate is 25%.', ['25 percent']],
    ['The answer is X.', ['X']],
    ['The answer: "x".', ['X']],
    ['The bit is 1.', ['1']],
  ])('detects the protected answer in %s', async (text, terms) => {
    const { leaks } = await import('./llm');
    expect(leaks(text, terms)).toBe(true);
  });

  it.each([
    ['Use the secretive wording.', ['secret']],
    ['Compare X and Z gates.', ['X']],
    ['Begin with round 1.', ['1']],
    ['Nothing to reveal.', ['', '  ']],
  ])('preserves legitimate teaching text: %s', async (text, terms) => {
    const { leaks } = await import('./llm');
    expect(leaks(text, terms)).toBe(false);
  });
});
