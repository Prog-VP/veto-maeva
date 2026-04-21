import { z } from 'zod'

export const catalogItemSchema = z.object({
  type: z.enum(['product', 'service']),
  name: z.string().min(1, 'Le nom est requis'),
  category: z.string().nullable().transform(v => v || null),
  default_price: z.coerce.number().min(0, 'Le prix doit être positif'),
  tax_rate: z.coerce.number().min(0).max(1),
  unit: z.string().nullable().transform(v => v || null),
  track_stock: z.boolean(),
  stock_quantity: z.coerce.number().int().min(0).default(0),
  stock_alert_threshold: z.coerce.number().int().min(0).nullable().catch(null),
})

export type CatalogItemFormData = z.infer<typeof catalogItemSchema>

// Input type for React Hook Form (before zod transforms)
export type CatalogItemFormInput = {
  type: 'product' | 'service'
  name: string
  category: string | null
  default_price: number
  tax_rate: number
  unit: string | null
  track_stock: boolean
  stock_quantity: number
  stock_alert_threshold: number | null
}
