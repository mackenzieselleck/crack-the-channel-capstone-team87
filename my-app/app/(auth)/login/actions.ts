'use server'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validation/auth'
import { redirect } from 'next/navigation'

//login user
export async function login(formData: FormData) {
    //validates user input
    const parsed = loginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        })
    if (!parsed.success) return { error: parsed.error.issues[0].message }
    //validates captcha token
    const captchaToken = formData.get('captchaToken') as string
    if (!captchaToken) return { error: 'Please complete the CAPTCHA' }
    //logs user in with supabase
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
        options: { captchaToken }
    })

    if (error) return { error: error.message }
    redirect('/dashboard')
}
