import { supabase } from '@/lib/supabase/client'
import { BaseService } from './base.service'

export interface Animal {
  id: string
  client_id: string
  name: string
  species: 'cheval' | 'chien' | 'chat'
  breed: string | null
  sex: 'male' | 'female' | 'unknown'
  birth_date: string | null
  weight: number | null
  chip_number: string | null
  photo_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  created_by: string | null
}

export interface AnimalWithClient extends Animal {
  clients: {
    id: string
    first_name: string
    last_name: string
  }
}

export async function uploadAnimalPhoto(animalId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${animalId}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('animal-photos')
    .upload(path, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('animal-photos')
    .getPublicUrl(path)

  return data.publicUrl
}

export async function deleteAnimalPhoto(animalId: string, photoUrl: string): Promise<void> {
  const fileName = photoUrl.split('/').pop()
  if (!fileName) return

  const { error } = await supabase.storage
    .from('animal-photos')
    .remove([fileName])

  if (error) throw error

  await supabase
    .from('animals')
    .update({ photo_url: null })
    .eq('id', animalId)
}

class AnimalsService extends BaseService<Animal> {
  constructor() {
    super('animals')
  }

  async getByClient(clientId: string): Promise<Animal[]> {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('client_id', clientId)
      .is('deleted_at', null)
      .order('name', { ascending: true })

    if (error) throw error
    return (data ?? []) as Animal[]
  }

  async getWithClient(id: string): Promise<AnimalWithClient> {
    const { data, error } = await supabase
      .from('animals')
      .select(`
        *,
        clients (id, first_name, last_name)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) throw error
    return data as AnimalWithClient
  }
}

export const animalsService = new AnimalsService()
