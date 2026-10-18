'use client';

import { useState } from 'react';
import type {
  QuizQuestion,
  QuizResult,
} from '@/lib/learning/types';

interface Props {
  questions: QuizQuestion[];
  passMark: number;
  result: QuizResult | null;
  busy: boolean;
  onSubmit: (answers: Record<string, number>) => void;
  onRetry: () => void;
}

export function Quiz({
  questions,
  passMark,
  result,
  busy,
  onSubmit,
  onRetry,
}: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const allAnswered = questions.every(
    (question) => answers[question.id] !== undefined,
  );

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface-raised p-7">
        <p className="font-medium text-text-primary">
          Test coming soon
        </p>

        <p className="mt-2 text-sm leading-6 text-text-secondary">
          The final test for this module has not been added yet.
        </p>
      </div>
    );
  }

  if (result) {
    const resultById = new Map(
      result.results.map((item) => [item.questionId, item]),
    );

    return (
      <div className="space-y-6">
        {/* Overall result */}
        <div
          className={[
            'rounded-xl border p-7',
            result.passed
              ? 'border-success/30 bg-success/10'
              : 'border-warning/30 bg-warning/10',
          ].join(' ')}
        >
          <p
            className={[
              'text-xs font-semibold uppercase tracking-[0.2em]',
              result.passed
                ? 'text-success'
                : 'text-warning',
            ].join(' ')}
          >
            {result.passed ? 'Module complete' : 'Keep learning'}
          </p>

          <h3 className="mt-3 text-3xl font-bold text-text-primary">
            {result.score}%
          </h3>

          <p className="mt-2 text-text-secondary">
            You answered {result.correctCount} of {result.total} questions
            correctly. The pass mark is {passMark}%.
          </p>
        </div>

        {/* XP / badges */}
        {result.passed && result.xpAwarded > 0 && (
          <div className="rounded-xl border border-accent/40 bg-accent/10 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Reward earned
            </p>

            <p className="mt-2 text-xl font-semibold text-white">
              +{result.xpAwarded} XP
            </p>

            {result.badgesAwarded.length > 0 && (
              <div className="mt-4 space-y-2">
                {result.badgesAwarded.map((badge) => (
                  <div
                    key={badge.id}
                    className="rounded-md border border-accent/30 bg-surface-raised px-4 py-3"
                  >
                    <p className="font-medium text-text-primary">
                      Badge earned: {badge.title}
                    </p>

                    {badge.description && (
                      <p className="mt-1 text-sm text-text-secondary">
                        {badge.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Question feedback */}
        <div className="space-y-4">
          {questions.map((question, index) => {
            const questionResult = resultById.get(question.id);

            return (
              <div
                key={question.id}
                className="rounded-xl border border-border bg-surface-raised p-6"
              >
                <div className="flex gap-4">
                  <div
                    className={[
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                      questionResult?.correct
                        ? 'bg-success/15 text-success'
                        : 'bg-danger/15 text-danger',
                    ].join(' ')}
                  >
                    {index + 1}
                  </div>

                  <div>
                    <p className="font-medium leading-7 text-text-primary">
                      {question.prompt}
                    </p>

                    <p
                      className={[
                        'mt-3 text-sm font-semibold',
                        questionResult?.correct
                          ? 'text-success'
                          : 'text-danger',
                      ].join(' ')}
                    >
                      {questionResult?.correct ? 'Correct' : 'Incorrect'}
                    </p>

                    {questionResult?.explanation && (
                      <p className="mt-2 text-sm leading-6 text-text-secondary">
                        {questionResult.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!result.passed && (
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              onRetry();
            }}
            className="rounded-md bg-accent px-6 py-3 font-semibold text-accent-contrast transition hover:bg-accent-strong"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((question, questionIndex) => (
        <fieldset
          key={question.id}
          className="rounded-xl border border-border bg-surface-raised p-6 sm:p-7"
        >
          <legend className="sr-only">
            Question {questionIndex + 1}
          </legend>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
              {questionIndex + 1}
            </div>

            <div className="w-full">
              <p className="font-medium leading-7 text-text-primary">
                {question.prompt}
              </p>

              <div className="mt-5 space-y-3">
                {question.options.map((option, optionIndex) => {
                  const selected =
                    answers[question.id] === optionIndex;

                  return (
                    <label
                      key={optionIndex}
                      className={[
                        'flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3.5 transition',
                        selected
                          ? 'border-accent bg-accent/10'
                          : 'border-border bg-surface hover:border-border-strong',
                      ].join(' ')}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        checked={selected}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            [question.id]: optionIndex,
                          }))
                        }
                        className="mt-1 accent-[#0F62FE]"
                      />

                      <span className="text-sm leading-6 text-text-secondary">
                        {option}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </fieldset>
      ))}

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-text-secondary">
          {Object.keys(answers).length} of {questions.length} answered
        </p>

        <button
          type="button"
          disabled={!allAnswered || busy}
          onClick={() => onSubmit(answers)}
          className="rounded-md bg-accent px-6 py-3 font-semibold text-accent-contrast transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? 'Submitting...' : 'Submit test'}
        </button>
      </div>
    </div>
  );
}