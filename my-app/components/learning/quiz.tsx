'use client';

import { useState } from 'react';
import type { QuizQuestion, QuizResult } from '@/lib/learning/types';

interface Props {
  questions: QuizQuestion[];
  passMark: number;
  result: QuizResult | null;
  busy: boolean;
  onSubmit: (answers: Record<string, number>) => void;
  onRetry: () => void;
}

export function Quiz({ questions, passMark, result, busy, onSubmit, onRetry }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  if (questions.length === 0) {
    return <p className="text-slate-500">The test for this module hasn&apos;t been added yet.</p>;
  }

  
  if (result) {
    const byId = new Map(result.results.map((r) => [r.questionId, r]));
    return (
      <div className="space-y-6">
        <div
          className={`rounded-lg p-4 ${
            result.passed ? 'bg-green-50 text-green-900' : 'bg-amber-50 text-amber-900'
          }`}
        >
          <p className="text-lg font-semibold">
            {result.passed ? 'Module complete!' : 'Not quite there yet'}
          </p>
          <p>
            You scored {result.score}% ({result.correctCount}/{result.total}). Pass mark is{' '}
            {passMark}%.
          </p>
        </div>

        {questions.map((q, i) => {
          const r = byId.get(q.id);
          return (
            <div key={q.id} className="rounded-lg border p-4">
              <p className="font-medium">
                {i + 1}. {q.prompt}
              </p>
              <p className={r?.correct ? 'text-green-700' : 'text-red-700'}>
                {r?.correct ? 'Correct' : 'Incorrect'}
              </p>
              {r?.explanation && <p className="mt-1 text-sm text-slate-600">{r.explanation}</p>}
            </div>
          );
        })}

        {!result.passed && (
          <button
            onClick={() => {
              setAnswers({});
              onRetry();
            }}
            className="rounded-md bg-slate-900 px-4 py-2 text-white"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  
  return (
    <div className="space-y-6">
      {questions.map((q, i) => (
        <fieldset key={q.id} className="rounded-lg border p-4">
          <legend className="px-1 font-medium">
            {i + 1}. {q.prompt}
          </legend>
          <div className="mt-2 space-y-2">
            {q.options.map((opt, idx) => (
              <label key={idx} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === idx}
                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: idx }))}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <button
        disabled={!allAnswered || busy}
        onClick={() => onSubmit(answers)}
        className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-40"
      >
        {busy ? 'Submitting…' : 'Submit test'}
      </button>
    </div>
  );
}