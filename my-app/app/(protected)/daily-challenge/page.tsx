import type { Metadata } from 'next';
import { requireOnboarding } from '@/lib/auth/guards';
import { ChallengeHub } from '@/components/daily-challenge/challengeHub';

export const metadata: Metadata = { title: 'Daily Challenge | Crack the Channel' };

export default async function DailyChallengePage() {
  await requireOnboarding();
  return <ChallengeHub />;
}
