'use server'
import { createClient } from '@/lib/supabase/server'
import { signupSchema } from '@/lib/validation/auth'

//signup users
export async function signup(formData: FormData) {
    //validate user input
    const parsed = signupSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })
    if (!parsed.success) return { error: parsed.error.issues[0].message }
    //validate turnstile captcha token
    const captchaToken = formData.get('captchaToken') as string
    if (!captchaToken) return { error: 'Please complete the CAPTCHA'}

    //create user with supabase signup
    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: { captchaToken, emailRedirectTo: '${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm'}
    })

    if (error) return { error: error.message }
    return { success:true }

}   
