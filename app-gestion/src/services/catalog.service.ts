import { supabase } from '@/lib/supabase/client'
import { BaseService, type PaginatedResult } from './base.service'
import * as bexio from './bexio/bexio.client'

export interface CatalogItem {
  id: string
  type: 'product' | 'service'
  name: string
  category: string | null
  default_price: number
  tax_rate: number
  unit: string | null
  track_stock: boolean
  stock_quantity: number
  stock_alert_threshold: number | null
  bexio_article_id: number | null
  bexio_synced_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  created_by: string | null
}

class CatalogService extends BaseService<CatalogItem> {
  constructor() {
    super('catalog_items')
  }

  async getByType(type: 'product' | 'service', search = '', page = 1, pageSize = 50): Promise<PaginatedResult<CatalogItem>> {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('catalog_items')
      .select('*', { count: 'exact' })
      .eq('type', type)
      .is('deleted_at', null)

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, error, count } = await query
      .order('name', { ascending: true })
      .range(from, to)

    if (error) throw error
    return { data: (data ?? []) as CatalogItem[], count: count ?? 0 }
  }

  async getLowStock(): Promise<CatalogItem[]> {
    const { data, error } = await supabase
      .from('catalog_items')
      .select('*')
      .eq('track_stock', true)
      .is('deleted_at', null)
      .order('stock_quantity', { ascending: true })

    if (error) throw error
    return ((data ?? []) as CatalogItem[]).filter(
      (item) => item.stock_alert_threshold !== null && item.stock_quantity <= item.stock_alert_threshold
    )
  }

  /**
   * Fetch all articles from Bexio and upsert them into the local catalog.
   * Bexio is the source of truth for products/services.
   */
  async syncFromBexio(): Promise<{ created: number; updated: number; deleted: number }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bexioArticles = await bexio.getArticles() as any[]

    let created = 0
    let updated = 0

    for (const article of bexioArticles) {
      const bexioId = article.id as number
      const type = article.article_type_id === 2 ? 'service' : 'product'

      const record = {
        type,
        name: article.intern_name ?? article.intern_code ?? `Article ${bexioId}`,
        category: article.article_group_id ? String(article.article_group_id) : null,
        default_price: parseFloat(article.sale_price ?? '0'),
        tax_rate: 0.077, // Default Swiss TVA
        unit: article.unit_name ?? null,
        track_stock: type === 'product' && Boolean(article.is_stock),
        bexio_article_id: bexioId,
        bexio_synced_at: new Date().toISOString(),
      }

      // Check if we already have this article locally
      const { data: existing } = await supabase
        .from('catalog_items')
        .select('id')
        .eq('bexio_article_id', bexioId)
        .limit(1)

      if (existing && existing.length > 0) {
        // Update existing
        await supabase
          .from('catalog_items')
          .update(record)
          .eq('id', existing[0].id)
        updated++
      } else {
        // Create new
        await supabase
          .from('catalog_items')
          .insert(record)
        created++
      }
    }

    // Soft-delete local items that no longer exist in Bexio
    const bexioIds = new Set(bexioArticles.map((a: { id: number }) => a.id))
    const { data: localWithBexio } = await supabase
      .from('catalog_items')
      .select('id, bexio_article_id')
      .not('bexio_article_id', 'is', null)
      .is('deleted_at', null)

    let deleted = 0
    for (const local of localWithBexio ?? []) {
      if (!bexioIds.has(local.bexio_article_id)) {
        await supabase
          .from('catalog_items')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', local.id)
        deleted++
      }
    }

    return { created, updated, deleted }
  }
}

export const catalogService = new CatalogService()
