import { z } from 'zod'

export const passwordSchema = z
.string()
.min(8, 'Password must be least 8 characters long')
.regex(/[a-z]/, 'Password must include at least one lowercase letter')
.regex(/[A-Z]/, 'Password must include at least one uppercase letter')
.regex(/[0-9]/, 'Password must include at least one number')
.regex(/[!@#$%^&*()_+-=|\{}[\];:,<>.'?"/`~]/, 'Password must include at least one special character')

export const signupSchema = z.object({
email: z.string().email(),
password: passwordSchema,
})

export const loginSchema = z.object({
email: z.string().email(),
password: z.string().min(1, 'Password is required'),
})
