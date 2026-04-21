import { supabase } from '@/lib/supabase/client'
import { BaseService, type PaginatedResult } from './base.service'
import * as bexio from './bexio/bexio.client'

export interface Invoice {
  id: string
  invoice_number: string
  client_id: string
  consultation_id: string | null
  date: string
  total_ht: number
  total_tax: number
  total_ttc: number
  status: 'draft' | 'sent' | 'paid' | 'cancelled'
  bexio_invoice_id: number | null
  bexio_pdf_url: string | null
  bexio_synced_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  created_by: string | null
}

export interface InvoiceWithClient extends Invoice {
  clients: { id: string; first_name: string; last_name: string; email: string | null }
}

export interface InvoiceLine {
  id: string
  invoice_id: string
  catalog_item_id: string | null
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  discount: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  created_by: string | null
}

export interface InvoiceWithLines extends Invoice {
  invoice_lines: InvoiceLine[]
  clients: { id: string; first_name: string; last_name: string; email: string | null }
}

class InvoicesService extends BaseService<Invoice> {
  constructor() {
    super('invoices')
  }

  async getAllWithClients(options: { orderBy?: string; ascending?: boolean } = {}): Promise<PaginatedResult<InvoiceWithClient>> {
    const { orderBy = 'created_at', ascending = false } = options

    const { data, error, count } = await supabase
      .from('invoices')
      .select(`
        *,
        clients (id, first_name, last_name, email)
      `, { count: 'exact' })
      .is('deleted_at', null)
      .order(orderBy, { ascending })

    if (error) throw error
    return { data: (data ?? []) as InvoiceWithClient[], count: count ?? 0 }
  }

  async getWithLines(id: string): Promise<InvoiceWithLines> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        clients (id, first_name, last_name, email),
        invoice_lines (*)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) throw error

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = data as any
    raw.invoice_lines = (raw.invoice_lines ?? []).filter(
      (l: { deleted_at: string | null }) => l.deleted_at === null,
    )
    return raw as InvoiceWithLines
  }

  async createFromConsultation(consultationId: string): Promise<Invoice> {
    // 1. Fetch consultation with items + catalog details + animal → client
    const { data: consultation, error: consultError } = await supabase
      .from('consultations')
      .select(`
        *,
        animals (id, client_id),
        consultation_items (
          id,
          quantity,
          unit_price,
          catalog_item_id,
          catalog_items (name, tax_rate)
        )
      `)
      .eq('id', consultationId)
      .single()

    if (consultError) throw consultError
    if (!consultation) throw new Error('Consultation non trouvée')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = consultation as any
    const clientId = raw.animals?.client_id
    if (!clientId) throw new Error('Client non trouvé pour cette consultation')

    const items = raw.consultation_items ?? []

    // 2. Calculate totals from consultation items
    let totalHt = 0
    let totalTax = 0

    const lines: Array<{
      catalog_item_id: string | null
      description: string
      quantity: number
      unit_price: number
      tax_rate: number
      discount: number
    }> = []

    for (const item of items) {
      const qty = item.quantity ?? 1
      const price = item.unit_price ?? 0
      const taxRate = item.catalog_items?.tax_rate ?? 0
      const lineHt = qty * price
      const lineTax = lineHt * taxRate

      totalHt += lineHt
      totalTax += lineTax

      lines.push({
        catalog_item_id: item.catalog_item_id ?? null,
        description: item.catalog_items?.name ?? 'Article',
        quantity: qty,
        unit_price: price,
        tax_rate: taxRate,
        discount: 0,
      })
    }

    const totalTtc = totalHt + totalTax

    // 3. Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        client_id: clientId,
        consultation_id: consultationId,
        date: new Date().toISOString().split('T')[0],
        total_ht: Math.round(totalHt * 100) / 100,
        total_tax: Math.round(totalTax * 100) / 100,
        total_ttc: Math.round(totalTtc * 100) / 100,
        status: 'draft' as const,
      })
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // 4. Create invoice lines
    if (lines.length > 0) {
      const { error: linesError } = await supabase
        .from('invoice_lines')
        .insert(
          lines.map((line) => ({
            ...line,
            invoice_id: invoice.id,
          })),
        )

      if (linesError) throw linesError
    }

    return invoice as Invoice
  }

  async addLine(
    invoiceId: string,
    line: Omit<InvoiceLine, 'id' | 'invoice_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'created_by'>,
  ): Promise<InvoiceLine> {
    const { data, error } = await supabase
      .from('invoice_lines')
      .insert({ ...line, invoice_id: invoiceId })
      .select()
      .single()

    if (error) throw error
    return data as InvoiceLine
  }

  async removeLine(lineId: string): Promise<void> {
    const { error } = await supabase
      .from('invoice_lines')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', lineId)

    if (error) throw error
  }

  async recalculateTotals(invoiceId: string): Promise<Invoice> {
    const { data: lines, error: linesError } = await supabase
      .from('invoice_lines')
      .select('*')
      .eq('invoice_id', invoiceId)
      .is('deleted_at', null)

    if (linesError) throw linesError

    let totalHt = 0
    let totalTax = 0

    for (const line of lines ?? []) {
      const lineHt = line.quantity * line.unit_price * (1 - (line.discount ?? 0) / 100)
      const lineTax = lineHt * (line.tax_rate ?? 0)
      totalHt += lineHt
      totalTax += lineTax
    }

    const totalTtc = totalHt + totalTax

    const { data, error } = await supabase
      .from('invoices')
      .update({
        total_ht: Math.round(totalHt * 100) / 100,
        total_tax: Math.round(totalTax * 100) / 100,
        total_ttc: Math.round(totalTtc * 100) / 100,
      })
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) throw error
    return data as Invoice
  }
  /**
   * Fetch all invoices from Bexio and upsert locally.
   * Maps Bexio contacts to local clients via bexio_contact_id.
   */
  async syncFromBexio(): Promise<{ created: number; updated: number; deleted: number }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bexioInvoices = await bexio.getInvoices() as any[]

    // Build a map of bexio_contact_id → local client id
    const { data: clients } = await supabase
      .from('clients')
      .select('id, bexio_contact_id')
      .not('bexio_contact_id', 'is', null)

    const clientMap = new Map<number, string>()
    for (const c of clients ?? []) {
      if (c.bexio_contact_id) clientMap.set(c.bexio_contact_id, c.id)
    }

    // Bexio kb_item_status_id mapping:
    // 7 = draft (Entwurf), 8 = pending (Ausstehend), 9 = sent/open (Offen)
    // 16 = paid (Bezahlt), 19 = cancelled (Storniert), 31 = partial
    const statusMap: Record<number, string> = {
      7: 'draft', 8: 'sent', 9: 'sent', 16: 'paid', 19: 'cancelled', 31: 'sent',
    }

    let created = 0
    let updated = 0

    for (const inv of bexioInvoices) {
      const bexioId = inv.id as number
      const localClientId = clientMap.get(inv.contact_id as number)

      // Skip if we don't have the client locally
      if (!localClientId) continue

      const record = {
        invoice_number: (inv.document_nr as string) || `BX-${bexioId}`,
        client_id: localClientId,
        date: (inv.is_valid_from as string) || new Date().toISOString().split('T')[0],
        total_ht: parseFloat(inv.total_net ?? '0'),
        total_tax: parseFloat(inv.total_taxes ?? '0'),
        total_ttc: parseFloat(inv.total ?? '0'),
        status: statusMap[inv.kb_item_status_id as number] ?? 'draft',
        bexio_invoice_id: bexioId,
        bexio_synced_at: new Date().toISOString(),
      }

      // Check if exists
      const { data: existing } = await supabase
        .from('invoices')
        .select('id')
        .eq('bexio_invoice_id', bexioId)
        .limit(1)

      if (existing && existing.length > 0) {
        await supabase.from('invoices').update(record).eq('id', existing[0].id)
        updated++
      } else {
        await supabase.from('invoices').insert(record)
        created++
      }
    }

    // Soft-delete local invoices that no longer exist in Bexio
    const bexioIds = new Set(bexioInvoices.map((inv: { id: number }) => inv.id))
    const { data: localWithBexio } = await supabase
      .from('invoices')
      .select('id, bexio_invoice_id')
      .not('bexio_invoice_id', 'is', null)
      .is('deleted_at', null)

    let deleted = 0
    for (const local of localWithBexio ?? []) {
      if (!bexioIds.has(local.bexio_invoice_id)) {
        await supabase
          .from('invoices')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', local.id)
        deleted++
      }
    }

    return { created, updated, deleted }
  }
}

export const invoicesService = new InvoicesService()
