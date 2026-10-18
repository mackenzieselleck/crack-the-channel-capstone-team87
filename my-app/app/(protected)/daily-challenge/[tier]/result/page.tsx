import type { Metadata } from 'next';
import { Suspense } from 'react';
import { requireOnboarding } from '@/lib/auth/guards';
import { ResultView } from '@/components/daily-challenge/resultView';

export const metadata: Metadata = { title: 'Challenge result | Crack the Channel' };

export default async function DailyChallengeResultPage() {
  await requireOnboarding();
  // view reads [tier] param on client
  return (
    <Suspense>
      <ResultView />
    </Suspense>
  );
}