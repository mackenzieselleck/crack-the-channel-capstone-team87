import Navbar from '@/components/spike/navbar';
import { requireOnboarding } from '@/lib/auth/guards';

export default async function Dashboard() {
  const { profile } = await requireOnboarding();

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold text-text-primary">
          Welcome, {profile.first_name}!
        </h1>

        <p className="mt-3 text-text-secondary">
          Let&apos;s start learning!
        </p>
      </main>
    </div>
  );
}
