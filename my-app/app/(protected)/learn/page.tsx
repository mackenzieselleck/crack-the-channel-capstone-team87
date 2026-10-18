'use client';

import { useState } from 'react';
import MascotCorner from '@/components/spike/mascotCorner';
import ChatBubble from '@/components/spike/chatbubble';
import { MOOD } from '@/lib/spike/mood';

const QUESTION = {
  prompt: 'In BB84, what does Alice use to encode each bit before sending it?',
  options: [
    { id: 'a', text: 'A randomly chosen polarization basis', correct: true },
    { id: 'b', text: 'A shared secret key agreed on beforehand', correct: false },
    { id: 'c', text: "Eve's measurement results", correct: false },
    { id: 'd', text: 'A classical encryption algorithm', correct: false },
  ],
};

//answer states
type AnswerState = 'unanswered' | 'correct' | 'incorrect';

export default function LearningPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<AnswerState>('unanswered');

  //changes mascot answer based on mood
  const mood =
    status === 'correct' ? MOOD.happy : status === 'incorrect' ? MOOD.sad : MOOD.neutral;

  //mascot feedback
  const feedback =
    status === 'correct'
      ? "Correct! A random basis is used for every bit."
      : status === 'incorrect'
      ? 'Not quite. Try again.'
      : null;

  //handles user choice
  function handleSelect(optionId: string, correct: boolean) {
    setSelectedId(optionId);
    setStatus(correct ? 'correct' : 'incorrect');
  }

  //handles retry
  function handleRetry() {
    setSelectedId(null);
    setStatus('unanswered');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 pb-40 pt-12">
      <h1 className="font-body text-2xl font-semibold text-text-primary">
        Quick check: encoding a bit
      </h1>

      <p className="text-text-secondary">{QUESTION.prompt}</p>

      <div className="flex flex-col gap-3">
        {QUESTION.options.map((option) => {
          const isSelected = selectedId === option.id;
          const showResult = isSelected && status !== 'unanswered';
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id, option.correct)}
              disabled={status !== 'unanswered'}
              className={[
                'rounded-xl border px-4 py-3 text-left text-text-primary transition',
                showResult && option.correct
                  ? 'border-success bg-success/10'
                  : showResult && !option.correct
                  ? 'border-danger bg-danger/10'
                  : 'border-border hover:border-border-strong',
              ].join(' ')}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      {status !== 'unanswered' && (
        <button
          onClick={handleRetry}
          className="self-start text-sm font-medium text-text-secondary underline underline-offset-4 hover:text-text-primary"
        >
          Try again
        </button>
      )}

      <MascotCorner
        mood={mood}
        bubble={
          feedback ? <ChatBubble key={`${status}-${selectedId}`} text={feedback} /> : undefined
        }
      />
    </main>
  );
}