'use client'
import { login } from './actions'
import { Turnstile } from '@marsidev/react-turnstile'
import Link from 'next/link'
import { useState } from 'react'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [captchaToken, setCaptchaToken] = useState('')

    return(
        <form
            action={async (formData) => {
                formData.set('captchaToken', captchaToken)
                const result = await login(formData)
                if (result?.error) setError(result.error)
            }}
        >
            <h1>Login</h1>
            <h2>Email:</h2>
            <input name="email" type="email" placeholder="email@example.com" required />
            <h2>Password:</h2>
            <input name="password" type="password" placeholder="Password" required />
            <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onSuccess={setCaptchaToken}
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit">Login</button>
            <p>New here? <Link href="/signup">Create an account</Link></p>
        </form>
    )
}