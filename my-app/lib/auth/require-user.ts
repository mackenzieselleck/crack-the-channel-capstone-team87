import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

//checks if auth user
export async function requireOnboarding() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    
    //checks if user is onboarded yet
    const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single()

    //if user isn't onboarded redirects user to onboarding
    if (!profile?.first_name || !profile?.last_name) redirect('/onboarding')
        return { user, profile }
}