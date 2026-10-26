import Navbar from '@/components/navbar';
import type { ReactNode } from 'react';
import { requireOnboarding } from '@/lib/auth/guards';
import { DailyChallengePopup } from '@/components/daily-challenge/dailyChallengePopup';
import { BadgeUnlockProvider } from '@/components/badges/badgeUnlockProvider';


export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user } = await requireOnboarding();

  return (
    <BadgeUnlockProvider userId={user.id}>
      <div className="...">
        <Navbar />
        {children}
        <DailyChallengePopup />
      </div>
    </BadgeUnlockProvider>
  );
}

