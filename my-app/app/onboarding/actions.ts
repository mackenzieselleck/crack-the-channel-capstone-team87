'use server';

import { createClient } from '@/lib/supabase/server';
import { profileSchema } from '@/lib/validation/profile';
import { redirect } from 'next/navigation';

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const parsed = profileSchema.safeParse({
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
  });

  if (!parsed.success) {
    redirect(
      `/onboarding?error=${encodeURIComponent(
        parsed.error.issues[0].message
      )}`
    );
  }

  const { error } = await supabase
    .from('profiles')
    .update(parsed.data)
    .eq('id', user.id);

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/dashboard');
}