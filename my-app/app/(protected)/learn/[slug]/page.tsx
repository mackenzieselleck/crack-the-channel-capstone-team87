import { ModuleShell } from '@/components/learning/moduleShell';
import { requireOnboarding } from '@/lib/auth/require-user';

export default async function LearnPage({ params }: { params: Promise<{ slug: string }> }) {
  //this route is outside the (protected) group, so it isn't guarded by that group's layout,
  //unlike the rest of the learning area
  //redirects signed out user to /login and users not signed up to /onboarding before 
  //module content is fetched and rendered 
  await requireOnboarding();
  const { slug } = await params;
  return <ModuleShell slug={slug} />;
}