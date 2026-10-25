import type { Metadata } from 'next';
import { Suspense } from 'react';
import { requireOnboarding } from '@/lib/auth/guards';
import { ChallengeView } from '@/components/daily-challenge/challengeView';

export const metadata: Metadata = { title: 'Daily Challenge | Crack the Channel' };

export default async function DailyChallengeTierPage() {
  await requireOnboarding();
  // view reads [tier] param on client
  return (
    <Suspense>
      <ChallengeView />
    </Suspense>
  );
}
