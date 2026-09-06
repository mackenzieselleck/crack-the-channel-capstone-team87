'use server'
import { createClient } from '@/lib/supabase/server'
import { profileSchema } from '@/lib/validation/profile'
import { redirect } from 'next/navigation'

//base onboarding form submision and error handling
export async function completeOnboarding(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    //checks user input against base user input validation
    const parsed = profileSchema.safeParse({
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
    })

//if invalid input return error
    if(!parsed.success) {
        redirect(`/onboarding?error=${encodeURIComponent(parsed.error.issues[0].message)}`)

    }
//sets onboarding inputs into user profile
    const { error } = await supabase
        .from('profiles')
        .update(parsed.data)
        .eq('id', user.id)
    //if supabase connection doesn't occur return error
    if (error) {
        redirect(`/onboarding?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/dashboard')

}