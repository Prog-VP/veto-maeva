import { supabase } from '@/lib/supabase/client'
import { BaseService } from './base.service'

export interface Consultation {
  id: string
  animal_id: string
  client_id: string | null
  date: string
  start_time: string | null
  end_time: string | null
  reason: string | null
  examination: string | null
  diagnosis: string | null
  treatment_plan: string | null
  notes: string | null
  color: string
  status: 'scheduled' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  deleted_at: string | null
  created_by: string | null
}

export interface ConsultationWithRelations extends Consultation {
  clients: { id: string; first_name: string; last_name: string } | null
  animals: {
    id: string; name: string; species: string; client_id: string
    clients: { id: string; first_name: string; last_name: string }
  }
}

export interface ConsultationItem {
  id: string
  consultation_id: string
  catalog_item_id: string | null
  quantity: number
  unit_price: number
  discount: number
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  created_by: string | null
}

export interface ConsultationItemWithCatalog extends ConsultationItem {
  catalog_items: { id: string; name: string; type: string; unit: string | null } | null
}

export interface ConsultationWithItems extends ConsultationWithRelations {
  consultation_items: ConsultationItemWithCatalog[]
}

class ConsultationsService extends BaseService<Consultation> {
  constructor() {
    super('consultations')
  }

  async getAllWithRelations(): Promise<ConsultationWithRelations[]> {
    const { data, error } = await supabase
      .from('consultations')
      .select(`
        *,
        clients (id, first_name, last_name),
        animals (id, name, species, client_id, clients (id, first_name, last_name))
      `)
      .is('deleted_at', null)
      .order('start_time', { ascending: false, nullsFirst: false })

    if (error) throw error
    return (data ?? []) as ConsultationWithRelations[]
  }

  async getByDateRange(start: string, end: string): Promise<ConsultationWithRelations[]> {
    const { data, error } = await supabase
      .from('consultations')
      .select(`
        *,
        clients (id, first_name, last_name),
        animals (id, name, species, client_id, clients (id, first_name, last_name))
      `)
      .is('deleted_at', null)
      .gte('start_time', start)
      .lte('start_time', end)
      .order('start_time', { ascending: true })

    if (error) throw error
    return (data ?? []) as ConsultationWithRelations[]
  }

  async getWithItems(id: string): Promise<ConsultationWithItems> {
    const { data, error } = await supabase
      .from('consultations')
      .select(`
        *,
        clients (id, first_name, last_name),
        animals (id, name, species, client_id, clients (id, first_name, last_name)),
        consultation_items (
          *,
          catalog_items (id, name, type, unit)
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) throw error

    // Filter out soft-deleted items
    const consultation = data as ConsultationWithItems
    consultation.consultation_items = (consultation.consultation_items ?? []).filter(
      (item) => item.deleted_at === null
    )

    return consultation
  }

  async addItem(consultationId: string, data: {
    catalog_item_id: string | null
    quantity: number
    unit_price: number
    discount: number
    notes: string | null
  }): Promise<ConsultationItemWithCatalog> {
    const { data: item, error } = await supabase
      .from('consultation_items')
      .insert({ ...data, consultation_id: consultationId })
      .select(`
        *,
        catalog_items (id, name, type, unit)
      `)
      .single()

    if (error) throw error
    return item as ConsultationItemWithCatalog
  }

  async updateItem(itemId: string, data: Partial<{
    quantity: number
    unit_price: number
    discount: number
    notes: string | null
  }>): Promise<ConsultationItemWithCatalog> {
    const { data: item, error } = await supabase
      .from('consultation_items')
      .update(data)
      .eq('id', itemId)
      .select(`
        *,
        catalog_items (id, name, type, unit)
      `)
      .single()

    if (error) throw error
    return item as ConsultationItemWithCatalog
  }

  async removeItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('consultation_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', itemId)

    if (error) throw error
  }
}

export const consultationsService = new ConsultationsService()
