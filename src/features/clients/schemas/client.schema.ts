import { z } from 'zod'

export const clientSchema = z.object({
  first_name: z.string().min(1, 'Le prénom est requis'),
  last_name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide').or(z.literal('')).nullable().transform(v => v || null),
  phone: z.string().nullable().transform(v => v || null),
  address: z.string().nullable().transform(v => v || null),
  notes: z.string().nullable().transform(v => v || null),
})

export type ClientFormData = z.infer<typeof clientSchema>
