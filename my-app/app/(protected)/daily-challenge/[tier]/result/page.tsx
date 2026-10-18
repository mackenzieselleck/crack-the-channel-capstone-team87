import type { Metadata } from 'next';
import { Suspense } from 'react';
import { requireOnboarding } from '@/lib/auth/guards';
import { ResultView } from '@/components/daily-challenge/resultView';

export const metadata: Metadata = { title: 'Challenge result | Crack the Channel' };

export default async function DailyChallengeResultPage() {
  await requireOnboarding();
  // Suspense: the view reads the [tier] param on the client.
  return (
    <Suspense>
      <ResultView />
    </Suspense>
  );
}