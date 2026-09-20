import Navbar from '@/components/spike/navbar';
import { requireOnboarding } from '@/lib/auth/require-user';

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