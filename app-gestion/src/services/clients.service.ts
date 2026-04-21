import { supabase } from '@/lib/supabase/client'
import { BaseService, type PaginatedResult } from './base.service'
import * as bexio from './bexio/bexio.client'

export interface Client {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  bexio_contact_id: number | null
  bexio_synced_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  created_by: string | null
}

export interface ClientWithAnimals extends Client {
  animals: Array<{
    id: string
    name: string
    species: string
    breed: string | null
  }>
}

class ClientsService extends BaseService<Client> {
  constructor() {
    super('clients')
  }

  async searchByName(query: string, page = 1, pageSize = 50): Promise<PaginatedResult<Client>> {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('last_name', { ascending: true })
      .range(from, to)

    if (error) throw error
    return { data: (data ?? []) as Client[], count: count ?? 0 }
  }

  async getWithAnimals(id: string): Promise<ClientWithAnimals> {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        animals (id, name, species, breed, deleted_at)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) throw error

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = data as any
    raw.animals = (raw.animals ?? []).filter((a: { deleted_at: string | null }) => a.deleted_at === null)
    return raw as ClientWithAnimals
  }
  /**
   * Fetch all contacts from Bexio and upsert them locally.
   * Bexio contacts are synced as clients (contact_type_id = 2 = person).
   */
  async syncFromBexio(): Promise<{ created: number; updated: number; deleted: number }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bexioContacts = await bexio.getContacts() as any[]

    let created = 0
    let updated = 0

    for (const contact of bexioContacts) {
      const bexioId = contact.id as number

      const record = {
        first_name: contact.name_2 || contact.name_1 || '',
        last_name: contact.name_1 || '',
        email: contact.mail || null,
        phone: contact.phone_fixed || contact.phone_mobile || null,
        address: [contact.address, contact.postcode, contact.city].filter(Boolean).join(', ') || null,
        bexio_contact_id: bexioId,
        bexio_synced_at: new Date().toISOString(),
      }

      // Check if already exists locally
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('bexio_contact_id', bexioId)
        .limit(1)

      if (existing && existing.length > 0) {
        await supabase
          .from('clients')
          .update(record)
          .eq('id', existing[0].id)
        updated++
      } else {
        await supabase
          .from('clients')
          .insert(record)
        created++
      }
    }

    // Soft-delete local clients that no longer exist in Bexio
    const bexioIds = new Set(bexioContacts.map((c: { id: number }) => c.id))
    const { data: localWithBexio } = await supabase
      .from('clients')
      .select('id, bexio_contact_id')
      .not('bexio_contact_id', 'is', null)
      .is('deleted_at', null)

    let deleted = 0
    for (const local of localWithBexio ?? []) {
      if (!bexioIds.has(local.bexio_contact_id)) {
        await supabase
          .from('clients')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', local.id)
        deleted++
      }
    }

    return { created, updated, deleted }
  }
}

export const clientsService = new ClientsService()
