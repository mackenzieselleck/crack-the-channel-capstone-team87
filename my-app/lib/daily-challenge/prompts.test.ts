import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatCompletion } from 'openai/resources/chat/completions';
import { llm } from './llm';
import {
  ChallengeText,
  FALLBACK_TEXT,
  summariseForLlm,
  writeChallengeText,
  writeFeedback,
  writeModuleMcq,
  type Challenge,
} from './prompts';

function reply(value: unknown): ChatCompletion {
  return {
    id: 'controlled-response', object: 'chat.completion', created: 0, model: 'test',
    choices: [{ index: 0, finish_reason: 'stop', logprobs: null,
      message: { role: 'assistant', content: JSON.stringify(value), refusal: null } }],
  };
}

const safeText = {
  title: 'Compare the bases',
  scenario: 'Alice and Bob need to compare their measurement bases.',
  task: 'Use the table below to work out the requested key.',
  hints: ['Think about matching bases.', 'Compare each pair of bases.', 'Begin with the first row.'],
};
const challenge: Challenge = {
  type: 'sifting', difficulty: 1, seed: 1, input_kind: 'bitstring',
  prompt_data: { task: 'keep_matching_bases' },
  answer: { bits: '101101', private_field: 'private answer marker' },
  options: [], worked_solution: 'private worked solution marker', leak_terms: ['101101'],
};
const passage = 'A qubit is a unit of quantum information. A classical bit can be zero or one.';
const mcq = {
  question: 'What is a unit of quantum information?',
  options: ['Qubit', 'Router', 'Packet', 'Cable'],
  correct_index: 0,
  supporting_quote: 'A qubit is a unit of quantum information.',
  explanation: 'The passage identifies a qubit as a unit of quantum information.',
};
const feedbackArgs = {
  type: 'sifting', correct: false, mistake_tag: 'wrong_key',
  explanation: 'Not quite. Compare the bases before keeping the corresponding bits.',
  attemptsLeft: 2, leakTerms: ['101101'], useLlm: true,
};

function spyCreate() { return vi.spyOn(llm.chat.completions, 'create'); }
let create: ReturnType<typeof spyCreate>;
beforeEach(() => {
  create = spyCreate().mockRejectedValue(new Error('Unexpected provider call'));
});
afterEach(() => { vi.restoreAllMocks(); });

describe('challenge text safeguards', () => {
  it.each(['title', 'scenario', 'task', 'hints'] as const)('rejects answer leaks in %s and accepts the safe retry', async (field) => {
    const leaked = { ...safeText, [field]: field === 'hints'
      ? ['The key is 101101.', ...safeText.hints.slice(1)]
      : `The key is 101101. ${safeText[field]}` };
    create.mockResolvedValueOnce(reply(leaked)).mockResolvedValueOnce(reply(safeText));
    expect(await writeChallengeText(challenge)).toEqual(safeText);
    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls[1][0].messages[1].content).toContain('reveals the answer');
  });

  it('throws if every title reveals the answer, allowing the route to use its template', async () => {
    create.mockResolvedValue(reply({ ...safeText, title: 'The key is 101101' }));
    await expect(writeChallengeText(challenge)).rejects.toThrow('failed validation');
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('sends a table description while retaining the original public table and excluding secrets', async () => {
    const rows = Array.from({ length: 48 }, (_, index) => ({ round: index + 1, basis: 'Z' }));
    const input = { ...challenge, prompt_data: { ...challenge.prompt_data, rows } };
    create.mockResolvedValue(reply(safeText));
    await writeChallengeText(input);
    const request = create.mock.calls[0][0];
    const user = request.messages[1].content as string;
    expect(JSON.parse(user).prompt_data.rows).toBe('(a table of 48 rows is shown to the user on screen)');
    expect(input.prompt_data.rows).toBe(rows);
    expect(rows).toHaveLength(48);
    expect(user).not.toContain('private answer marker');
    expect(user).not.toContain('private worked solution marker');
    expect(user).not.toContain('101101');
    expect(request.messages[0].content).toContain('untrusted data');
    expect(request.messages[0].content).toContain('the table below');
  });

  it('preserves small tables, primitive lists and null lists', () => {
    const data = { small: [{ round: 1 }], primitives: Array(8).fill('Z'), empty: [], nulls: Array(8).fill(null) };
    expect(summariseForLlm(data)).toEqual(data);
    expect(summariseForLlm(data)).not.toBe(data);
  });

  it('does not contact the model after the shared deadline has passed', async () => {
    await expect(writeChallengeText(challenge, Date.now() - 1)).rejects.toThrow(/deadline|budget/i);
    expect(create).not.toHaveBeenCalled();
  });

  it('keeps every category fallback structurally valid', () => {
    expect(Object.keys(FALLBACK_TEXT)).toHaveLength(6);
    for (const text of Object.values(FALLBACK_TEXT)) expect(ChallengeText.safeParse(text).success).toBe(true);
  });
});

describe('feedback safeguards', () => {
  it.each([
    'Correct! Your answer is right. Keep using this method.',
    'Your answer is correct. Well done on this challenge.',
    "That's right! You have found the requested key.",
    'You got it right! Keep using this method.',
  ])('falls back when an incorrect grade receives an explicit positive verdict: %s', async (message) => {
    create.mockResolvedValue(reply({ message }));
    expect(await writeFeedback(feedbackArgs)).toBe(feedbackArgs.explanation);
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('falls back when a correct grade receives an explicit negative verdict', async () => {
    create.mockResolvedValue(reply({ message: 'Incorrect! Your answer is wrong. Try a different method.' }));
    const args = { ...feedbackArgs, correct: true, explanation: 'Correct: the kept bits match the bases.' };
    expect(await writeFeedback(args)).toBe(args.explanation);
  });

  it('rejects you-got-it-wrong feedback after a correct grade', async () => {
    create.mockResolvedValue(reply({ message: 'You got it wrong. Try another method next time.' }));
    const args = { ...feedbackArgs, correct: true, explanation: 'Correct: the kept bits match the bases.' };
    expect(await writeFeedback(args)).toBe(args.explanation);
  });

  it('retries a leaked answer while attempts remain and excludes leak terms from its request', async () => {
    create.mockResolvedValueOnce(reply({ message: 'Not quite. The answer is 101101.' }))
      .mockResolvedValueOnce(reply({ message: 'Not quite. Compare each pair of bases before keeping a bit.' }));
    expect(await writeFeedback(feedbackArgs)).toBe('Not quite. Compare each pair of bases before keeping a bit.');
    expect(create.mock.calls[0][0].messages[1].content).not.toContain('101101');
    expect(create.mock.calls[0][1]?.timeout).toBeLessThanOrEqual(8_000);
  });

  it('permits answer explanations after attempts are exhausted', async () => {
    create.mockResolvedValue(reply({ message: 'Not quite. The answer is 101101, from the matching bases.' }));
    expect(await writeFeedback({ ...feedbackArgs, attemptsLeft: 0 })).toContain('101101');
  });

  it('returns the grader explanation without a call when disabled or out of time', async () => {
    expect(await writeFeedback({ ...feedbackArgs, useLlm: false })).toBe(feedbackArgs.explanation);
    expect(await writeFeedback({ ...feedbackArgs, deadlineAt: Date.now() - 1 })).toBe(feedbackArgs.explanation);
    expect(create).not.toHaveBeenCalled();
  });

  it('returns the grader explanation when the provider fails', async () => {
    create.mockRejectedValue(new Error('provider unavailable'));
    expect(await writeFeedback(feedbackArgs)).toBe(feedbackArgs.explanation);
  });
});

describe('module question safeguards', () => {
  it.each(['All of the above', ' NONE   OF THE ABOVE. ', '(D) All of the above!', 'none of above'])('rejects forbidden choice %s', async (option) => {
    create.mockResolvedValue(reply({ ...mcq, options: ['Qubit', 'Router', 'Packet', option] }));
    await expect(writeModuleMcq(passage)).rejects.toThrow('failed validation');
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('verifies a valid question independently and serializes source content as data', async () => {
    create.mockResolvedValueOnce(reply(mcq)).mockResolvedValueOnce(reply({ index: 0 }));
    expect(await writeModuleMcq(passage)).toEqual(mcq);
    expect(JSON.parse(create.mock.calls[0][0].messages[1].content as string)).toEqual({ passage });
    expect(JSON.parse(create.mock.calls[1][0].messages[1].content as string)).toEqual({ passage, question: mcq.question, options: mcq.options });
    expect(create.mock.calls[0][0].messages[0].content).toContain('untrusted');
    expect(create.mock.calls[1][0].messages[0].content).toContain('untrusted');
    expect(create.mock.calls[1][0].messages[1].content).not.toContain('correct_index');
  });

  it.each([
    { ...mcq, correct_index: 1 },
    { ...mcq, options: ['bit', 'Router', 'Packet', 'Cable'] },
  ])('rejects an unsupported selected option, including a substring of a quoted word', async (question) => {
    create.mockResolvedValue(reply(question));
    await expect(writeModuleMcq(passage)).rejects.toThrow('distinct phrase');
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('rejects a fabricated quote and normalized duplicate choices before verification', async () => {
    create.mockResolvedValueOnce(reply({ ...mcq, supporting_quote: 'This sentence is not in the module.' }))
      .mockResolvedValueOnce(reply({ ...mcq, options: ['Qubit', ' qubit ', 'Router', 'Cable'] }));
    await expect(writeModuleMcq(passage)).rejects.toThrow('failed validation');
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('rejects verifier disagreement and invalid verifier indices', async () => {
    create.mockResolvedValueOnce(reply(mcq)).mockResolvedValueOnce(reply({ index: 1 }));
    await expect(writeModuleMcq(passage)).rejects.toThrow('self-consistency');
    create.mockResolvedValueOnce(reply(mcq)).mockResolvedValueOnce(reply({ index: 4 }));
    await expect(writeModuleMcq(passage)).rejects.toThrow('failed validation');
  });

  it('shares one deadline between generation and verification', async () => {
    const now = Date.now();
    const clock = vi.spyOn(Date, 'now').mockReturnValue(now);
    create.mockImplementationOnce(() => {
      clock.mockReturnValue(now + 5_000);
      return Promise.resolve(reply(mcq)) as ReturnType<typeof llm.chat.completions.create>;
    })
      .mockResolvedValueOnce(reply({ index: 0 }));
    await writeModuleMcq(passage, now + 7_000);
    expect(create.mock.calls[0][1]?.timeout).toBeLessThanOrEqual(7_000);
    expect(create.mock.calls[1][1]?.timeout).toBeLessThanOrEqual(2_000);
  });
});
