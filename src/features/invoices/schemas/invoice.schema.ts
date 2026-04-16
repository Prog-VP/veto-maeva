import { z } from 'zod'

export const invoiceSchema = z.object({
  client_id: z.string().min(1, 'Le client est requis'),
  date: z.string().min(1, 'La date est requise'),
  status: z.enum(['draft', 'sent', 'paid', 'cancelled']).default('draft'),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>

export const invoiceLineSchema = z.object({
  description: z.string().min(1, 'La description est requise'),
  quantity: z.coerce.number().min(0.01, 'La quantité doit être supérieure à 0'),
  unit_price: z.coerce.number().min(0, 'Le prix unitaire est requis'),
  tax_rate: z.coerce.number().min(0).max(100).default(0),
  discount: z.coerce.number().min(0).max(100).default(0),
})

export type InvoiceLineFormData = z.infer<typeof invoiceLineSchema>
