import { z } from 'zod'
//basic  user input validation
export const profileSchema = z.object({
    first_name: z.string().trim().min(1, 'First name is required').max(50),
    last_name: z.string().trim().min(1, 'Last name is required').max(50),
})