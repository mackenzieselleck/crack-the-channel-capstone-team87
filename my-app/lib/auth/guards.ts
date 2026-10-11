import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// logged in check
export const requireUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) redirect('/login')
  return { supabase, user }
})

// logged in AND onboarded check
export const requireOnboarding = cache(async () => {
  const { supabase, user } = await requireUser()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .maybeSingle() // missing row -> null instead of an error

  if (error) {
    // query failure shouldn't send onboarded users back to onboarding
    console.error('[requireOnboarding] profile query failed:', error.code)
    throw new Error('Unable to load your profile. Please try again.')
  }

  if (!profile?.first_name?.trim() || !profile?.last_name?.trim()) {
    redirect('/onboarding')
  }

  return { user, profile }
})
