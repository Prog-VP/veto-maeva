import { z } from 'zod'

export const appointmentSchema = z.object({
  client_id: z.string().min(1, 'Le client est requis'),
  animal_id: z.union([z.string().uuid(), z.literal('')]).nullable().transform(v => v || null),
  start_time: z.string().min(1, "L'heure de début est requise"),
  end_time: z.string().min(1, "L'heure de fin est requise"),
  reason: z.string().nullable().transform(v => v || null),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).default('scheduled'),
  color: z.string().default('#f97316'),
  notes: z.string().nullable().transform(v => v || null),
})

export type AppointmentFormData = z.output<typeof appointmentSchema>
