import { z } from 'zod';

// Zod schemas mirror the backend Bean Validation rules so the client fails
// fast with the same errors before making a round-trip.
// z.infer<typeof schema> gives us the TypeScript type for free.

export const emailSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
});
export type EmailFormValues = z.infer<typeof emailSchema>;

export const codeSchema = z.object({
  // Backend: @Pattern(regexp = "\\d{4,8}") — digits only, 4-8 length.
  code: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/, 'Code must be 4–8 digits'),
});
export type CodeFormValues = z.infer<typeof codeSchema>;

export const registerSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  fullName: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .max(255, 'Full name is too long'),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;
