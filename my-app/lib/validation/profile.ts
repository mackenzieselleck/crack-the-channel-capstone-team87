import { z } from 'zod'

// includes letters from any language, plus spaces, hyphens, apostrophes and full stops
const name = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(50, `${label} must be 50 characters or fewer`)
    .regex(/^[\p{L}\p{M}' .-]+$/u, `${label} can only contain letters, spaces, hyphens and apostrophes`)
    .transform((s) => s.replace(/\s+/g, ' ')) // collapse repeated spaces

// basic user input validation
export const profileSchema = z.object({
  first_name: name('First name'),
  last_name: name('Last name'),
})