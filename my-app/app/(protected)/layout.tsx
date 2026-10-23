import Navbar from '@/components/navbar';
import { requireOnboarding } from '@/lib/auth/guards';
import { DailyChallengePopup } from '@/components/daily-challenge/dailyChallengePopup';
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOnboarding();

  return (
    <div className="...">
       <Navbar />
       {children}
       <DailyChallengePopup />
     </div>
  );
}