import { supabase } from '@/lib/supabase/client'

export interface PaginationOptions {
  page?: number
  pageSize?: number
  orderBy?: string
  ascending?: boolean
}

export interface PaginatedResult<T> {
  data: T[]
  count: number
}

export class BaseService<T extends { id: string }> {
  constructor(protected tableName: string) {}

  async getAll(options: PaginationOptions = {}): Promise<PaginatedResult<T>> {
    const { page = 1, pageSize = 50, orderBy = 'created_at', ascending = false } = options

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order(orderBy, { ascending })
      .range(from, to)

    if (error) throw error
    return { data: (data ?? []) as T[], count: count ?? 0 }
  }

  async getById(id: string): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) throw error
    return data as T
  }

  async create(record: Partial<Omit<T, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(record as never)
      .select()
      .single()

    if (error) throw error
    return data as T
  }

  async update(id: string, record: Partial<T>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(record as never)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as T
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  }

  async restore(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ deleted_at: null })
      .eq('id', id)

    if (error) throw error
  }

  async search(column: string, query: string, options: PaginationOptions = {}): Promise<PaginatedResult<T>> {
    const { page = 1, pageSize = 50, orderBy = 'created_at', ascending = false } = options

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .ilike(column, `%${query}%`)
      .order(orderBy, { ascending })
      .range(from, to)

    if (error) throw error
    return { data: (data ?? []) as T[], count: count ?? 0 }
  }
}
