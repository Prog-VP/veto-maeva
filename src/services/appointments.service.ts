import { supabase } from '@/lib/supabase/client'
import { BaseService } from './base.service'

export interface Appointment {
  id: string
  client_id: string
  animal_id: string | null
  start_time: string
  end_time: string
  reason: string | null
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  consultation_id: string | null
  color: string
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  created_by: string | null
}

export interface AppointmentWithRelations extends Appointment {
  clients: { id: string; first_name: string; last_name: string }
  animals: { id: string; name: string; species: string } | null
}

class AppointmentsService extends BaseService<Appointment> {
  constructor() {
    super('appointments')
  }

  async getByDateRange(start: string, end: string): Promise<AppointmentWithRelations[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        clients (id, first_name, last_name),
        animals (id, name, species)
      `)
      .is('deleted_at', null)
      .gte('start_time', start)
      .lte('end_time', end)
      .order('start_time', { ascending: true })

    if (error) throw error
    return (data ?? []) as AppointmentWithRelations[]
  }

  async getToday(): Promise<AppointmentWithRelations[]> {
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()
    return this.getByDateRange(start, end)
  }
}

export const appointmentsService = new AppointmentsService()
