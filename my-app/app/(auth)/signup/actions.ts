'use server'
import { createClient } from '@/lib/supabase/server'
import { signupSchema } from '@/lib/validation/auth'

//signup users
export async function signup(formData: FormData) {
    // validate user input
    const parsed = signupSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })
    if (!parsed.success) return { error: parsed.error.issues[0].message }
    // confirm password matches
    if (formData.get('confirmPassword') !== parsed.data.password) {
        return { error: 'Passwords do not match' }
    }
    // validate turnstile captcha token
    const captchaToken = formData.get('captchaToken') as string
    if (!captchaToken) return { error: 'Please complete the CAPTCHA'}

    // create user with supabase signup
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: { captchaToken, emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`}
    })

    if (error) {
        // log error code only, never email or password
        console.error('[signup] failed:', error.code ?? error.name, error.status, error.message)
 
        if (error.message?.toLowerCase().includes('captcha')) {
            return { error: 'CAPTCHA verification failed. Please try again.' }
        }
        if (error.code === 'weak_password') {
            return { error: 'That password is too weak. Try a longer one.' }
        }
         // returned when email confirmation is turned off in Supabase
        if (error.code === 'user_already_exists' || error.code === 'email_exists') {
            return { error: "User already exists. Please try logging in instead." }
        }

        return { error: 'Unable to create account. Please try again.' }
    }
    // returned when email confirmation is on and a user is already signed up
    if (data.user && data.user.identities?.length === 0) {
        return { error: "User already exists. Please try logging in instead." }
    }
    return { success:true }

}   
