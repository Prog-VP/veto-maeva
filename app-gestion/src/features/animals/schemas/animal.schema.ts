import { z } from 'zod'

export const animalSchema = z.object({
  name: z.string().min(1, "Le nom de l'animal est requis"),
  species: z.enum(['cheval', 'chien', 'chat']),
  breed: z.string().nullable().transform(v => v || null),
  sex: z.enum(['male', 'female', 'unknown']),
  birth_date: z.string().nullable().transform(v => v || null),
  weight: z.coerce.number().positive().nullable().catch(null),
  chip_number: z.string().nullable().transform(v => v || null),
  notes: z.string().nullable().transform(v => v || null),
  client_id: z.string().uuid(),
})

export type AnimalFormData = z.output<typeof animalSchema>
