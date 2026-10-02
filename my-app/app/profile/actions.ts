'use server'
import { createClient } from '@/lib/supabase/server'
import { profileSchema } from '@/lib/validation/profile'
import { redirect } from 'next/navigation'

//handles profile edit form submission and error handling
export async function updateProfile(formData: FormData) {
    const supabase = await createClient()                      //creates connection to supabase tied to this request's cookies 
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    //checks user input against base user input validation
    const parsed = profileSchema.safeParse({
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
    })

    //if invalid input return error
    if (!parsed.success) {
        redirect(`/profile/edit?error=${encodeURIComponent(parsed.error.issues[0].message)}`)
    }

    //updates user profile in database with new values
    const { error } = await supabase
        .from('profiles')
        .update(parsed.data)
        .eq('id', user.id)

    //if supabase connection doesn't occur return error
    if (error) {
        redirect(`/profile/edit?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/profile')
}