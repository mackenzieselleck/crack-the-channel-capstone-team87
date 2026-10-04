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
      <div className="rounded-xl border border-[#233049] bg-[#111B2E] p-7">
        <p className="font-medium text-[#E7ECF5]">
          Test coming soon
        </p>

        <p className="mt-2 text-sm leading-6 text-[#8B95AC]">
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
              ? 'border-[#4ADE80]/30 bg-[#4ADE80]/10'
              : 'border-[#FBBF24]/30 bg-[#FBBF24]/10',
          ].join(' ')}
        >
          <p
            className={[
              'text-xs font-semibold uppercase tracking-[0.2em]',
              result.passed
                ? 'text-[#4ADE80]'
                : 'text-[#FBBF24]',
            ].join(' ')}
          >
            {result.passed ? 'Module complete' : 'Keep learning'}
          </p>

          <h3 className="mt-3 text-3xl font-bold text-[#E7ECF5]">
            {result.score}%
          </h3>

          <p className="mt-2 text-[#C5CDD9]">
            You answered {result.correctCount} of {result.total} questions
            correctly. The pass mark is {passMark}%.
          </p>
        </div>

        {/* XP / badges */}
        {result.passed && result.xpAwarded > 0 && (
          <div className="rounded-xl border border-[#0F62FE]/40 bg-[#0F62FE]/10 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4C8DFF]">
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
                    className="rounded-md border border-[#2F4770] bg-[#111B2E] px-4 py-3"
                  >
                    <p className="font-medium text-[#E7ECF5]">
                      Badge earned: {badge.title}
                    </p>

                    {badge.description && (
                      <p className="mt-1 text-sm text-[#8B95AC]">
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
                className="rounded-xl border border-[#233049] bg-[#111B2E] p-6"
              >
                <div className="flex gap-4">
                  <div
                    className={[
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                      questionResult?.correct
                        ? 'bg-[#4ADE80]/15 text-[#4ADE80]'
                        : 'bg-[#F87171]/15 text-[#F87171]',
                    ].join(' ')}
                  >
                    {index + 1}
                  </div>

                  <div>
                    <p className="font-medium leading-7 text-[#E7ECF5]">
                      {question.prompt}
                    </p>

                    <p
                      className={[
                        'mt-3 text-sm font-semibold',
                        questionResult?.correct
                          ? 'text-[#4ADE80]'
                          : 'text-[#F87171]',
                      ].join(' ')}
                    >
                      {questionResult?.correct ? 'Correct' : 'Incorrect'}
                    </p>

                    {questionResult?.explanation && (
                      <p className="mt-2 text-sm leading-6 text-[#8B95AC]">
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
            className="rounded-md bg-[#0F62FE] px-6 py-3 font-semibold text-white transition hover:bg-[#0353E9]"
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
          className="rounded-xl border border-[#233049] bg-[#111B2E] p-6 sm:p-7"
        >
          <legend className="sr-only">
            Question {questionIndex + 1}
          </legend>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F62FE]/15 text-sm font-semibold text-[#4C8DFF]">
              {questionIndex + 1}
            </div>

            <div className="w-full">
              <p className="font-medium leading-7 text-[#E7ECF5]">
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
                          ? 'border-[#0F62FE] bg-[#0F62FE]/10'
                          : 'border-[#2A3850] bg-[#0D1728] hover:border-[#536078]',
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

                      <span className="text-sm leading-6 text-[#C5CDD9]">
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
        <p className="text-sm text-[#8B95AC]">
          {Object.keys(answers).length} of {questions.length} answered
        </p>

        <button
          type="button"
          disabled={!allAnswered || busy}
          onClick={() => onSubmit(answers)}
          className="rounded-md bg-[#0F62FE] px-6 py-3 font-semibold text-white transition hover:bg-[#0353E9] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? 'Submitting...' : 'Submit test'}
        </button>
      </div>
    </div>
  );
}