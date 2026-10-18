import { ModuleShell } from '@/components/learning/moduleShell';
import { requireOnboarding } from '@/lib/auth/guards';

export default async function LearnPage({ params }: { params: Promise<{ slug: string }> }) {

  const { slug } = await params;
  return <ModuleShell slug={slug} />
}