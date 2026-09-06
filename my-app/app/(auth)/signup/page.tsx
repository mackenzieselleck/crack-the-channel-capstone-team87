'use client'
import { signup } from './actions'
import { Turnstile } from '@marsidev/react-turnstile'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
//sign up user
export default function SignUpPage() {
    const [error, setError] = useState<string | null>(null)
    const [captchaToken, setCaptchaToken] = useState('')
    const router = useRouter()

    return(
        <form
            action={async (formData) => {
                formData.set('captchaToken', captchaToken)
                const result = await signup(formData)
                if (result?.error) setError(result.error)
                else router.push('/email-confirmation')
            }}
        >
            <h1>Create an Account</h1>
            <h2>Email:</h2>
            <input name="email" type="email" placeholder="email@example.com" required />
            <h2>Password:</h2>
            <input name="password" type="password" placeholder="Password" required />
            <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onSuccess={setCaptchaToken}
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit">Sign Up</button>
        </form>
    )
}
