import Navbar from '@/components/spike/navbar';
import { requireOnboarding } from '@/lib/auth/guards';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOnboarding();

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}