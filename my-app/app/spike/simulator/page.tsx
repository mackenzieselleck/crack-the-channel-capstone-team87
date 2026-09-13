'use client';

import { useCallback, useState } from 'react';
import BB84Walkthrough, { type Bb84NarrationEvent } from '@/components/spike/bb84Walkthrough';
import MascotCorner from '@/components/spike/mascotCorner';
import ChatBubble from '@/components/spike/chatbubble';
import { MOOD } from '@/lib/spike/mood';

export default function SimulatorPage() {
  const [narration, setNarration] = useState<Bb84NarrationEvent | null>(null);

  //takes in narration event
  const handleNarrate = useCallback((event: Bb84NarrationEvent) => {
    setNarration(event);
  }, []);

  return (
    <main className="relative min-h-screen px-6 pb-40 pt-12">
      <h1 className="font-body text-2xl font-semibold text-[#E7ECF5]">
        BB84 simulator
      </h1>
      <p className="mt-2 max-w-xl text-[#8B95AC]">
        Run a BB84 key exchange between Alice and Bob, and see what happens when Eve tries to
        listen.
      </p>

      <div className="mt-8">
        <BB84Walkthrough onNarrate={handleNarrate} />
      </div>

  
      <MascotCorner
        //checks narration mood and sets it
        mood={narration?.mood ?? MOOD.neutral}
        bubble={
          narration ? (
            //change chatbubble when message changes
            <ChatBubble key={`${narration.role ?? 'none'}-${narration.step}`} text={narration.body} />
          ) : undefined
        }
      />
    </main>
  );
}