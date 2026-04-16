import { z } from 'zod'

export const consultationSchema = z.object({
  client_id: z.string().min(1, 'Le client est requis'),
  animal_id: z.union([z.string().uuid(), z.literal('')]).nullable().transform(v => v || null),
  start_time: z.string().min(1, "L'heure de début est requise"),
  end_time: z.string().min(1, "L'heure de fin est requise"),
  reason: z.string().nullable().transform(v => v || null),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
  color: z.string().default('#f97316'),
  examination: z.string().nullable().transform(v => v || null),
  diagnosis: z.string().nullable().transform(v => v || null),
  treatment_plan: z.string().nullable().transform(v => v || null),
  notes: z.string().nullable().transform(v => v || null),
})

export type ConsultationFormData = z.output<typeof consultationSchema>

export const consultationItemSchema = z.object({
  catalog_item_id: z.string().min(1, "L'article est requis").nullable(),
  quantity: z.coerce.number().min(0.01, 'La quantité doit être supérieure à 0'),
  unit_price: z.coerce.number().min(0, 'Le prix doit être positif'),
  discount: z.coerce.number().min(0).max(100, 'La remise ne peut dépasser 100%').default(0),
  notes: z.string().nullable().transform(v => v || null),
})

export type ConsultationItemFormData = z.infer<typeof consultationItemSchema>
