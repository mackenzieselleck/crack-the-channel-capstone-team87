import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { completeOnboarding } from './actions'

//placeholder form for onboarding process
export default async function OnboardingPage({ searchParams }: {
    searchParams: Promise<{ error?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    
    const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single()

    if(profile?.first_name && profile?.last_name) redirect('/dashboard')
    const { error } = await searchParams

    return (
        <form action={completeOnboarding}>
            <h1>Tell us your name</h1>
            <input name="first_name" placeholder="First Name" required />
            <input name="last_name" placeholder="Last Name" required />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit">Continue</button>
        </form>
    )
}