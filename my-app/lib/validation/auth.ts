import { z } from 'zod'

export const passwordSchema = z
.string()
.min(8, 'Password must be least 8 characters long')
.max(72, 'Password must be 72 characters or fewer')
.regex(/[a-z]/, 'Password must include at least one lowercase letter')
.regex(/[A-Z]/, 'Password must include at least one uppercase letter')
.regex(/[0-9]/, 'Password must include at least one number')
.regex(/[^A-Za-z0-9]/, 'Password must include at least one special character')

export const signupSchema = z.object({
email: z.string().trim().toLowerCase().email('Enter a valid email address'),
password: passwordSchema,
})

export const loginSchema = z.object({
email: z.string().trim().toLowerCase().email('Enter a valid email address'),
password: z.string().min(1, 'Password is required'),
})
