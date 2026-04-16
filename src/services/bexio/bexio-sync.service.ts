import { supabase } from '@/lib/supabase/client'
import * as bexio from './bexio.client'
import type { Client } from '@/services/clients.service'
import type { CatalogItem } from '@/services/catalog.service'
import type { Invoice, InvoiceLine } from '@/services/invoices.service'

/**
 * Sync a client to Bexio as a contact.
 * Creates or updates depending on whether bexio_contact_id exists.
 * Updates the client record with the bexio_contact_id.
 */
export async function syncClient(client: Client): Promise<void> {
  const payload = {
    name: client.last_name,
    firstName: client.first_name,
    email: client.email ?? undefined,
    phone: client.phone ?? undefined,
    address: client.address ?? undefined,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let bexioResult: any

  if (client.bexio_contact_id) {
    bexioResult = await bexio.updateContact(client.bexio_contact_id, payload)
  } else {
    bexioResult = await bexio.createContact(payload)
  }

  const bexioId = bexioResult?.id ?? client.bexio_contact_id
  if (bexioId) {
    await supabase
      .from('clients')
      .update({
        bexio_contact_id: bexioId,
        bexio_synced_at: new Date().toISOString(),
      })
      .eq('id', client.id)
  }
}

/**
 * Sync a catalog item to Bexio as an article.
 */
export async function syncCatalogItem(item: CatalogItem): Promise<void> {
  // Bexio doesn't have a clean update for articles, so we only create if no bexio_article_id
  if (item.bexio_article_id) {
    // Just mark as synced (Bexio article update is limited)
    await supabase
      .from('catalog_items')
      .update({ bexio_synced_at: new Date().toISOString() })
      .eq('id', item.id)
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bexioResult: any = await bexio.createArticle({
    name: item.name,
    type: item.type,
    price: item.default_price,
  })

  if (bexioResult?.id) {
    await supabase
      .from('catalog_items')
      .update({
        bexio_article_id: bexioResult.id,
        bexio_synced_at: new Date().toISOString(),
      })
      .eq('id', item.id)
  }
}

/**
 * Sync an invoice to Bexio: create invoice + positions + issue it.
 * Requires the client to have a bexio_contact_id.
 */
export async function syncInvoice(
  invoice: Invoice,
  lines: InvoiceLine[],
): Promise<void> {
  // Get the client's bexio_contact_id
  const { data: client } = await supabase
    .from('clients')
    .select('bexio_contact_id')
    .eq('id', invoice.client_id)
    .single()

  if (!client?.bexio_contact_id) {
    throw new Error('Le client doit être synchronisé avec Bexio avant de pouvoir synchroniser la facture')
  }

  // Create invoice in Bexio
  const bexioInvoice = await bexio.createInvoice({
    contactId: client.bexio_contact_id,
    title: `Facture ${invoice.invoice_number}`,
    date: invoice.date,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bexioInvoiceId = (bexioInvoice as any).id as number

  // Get Bexio taxes for mapping
  const taxes = await bexio.getTaxes()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const defaultTaxId = (taxes as any[])?.[0]?.id ?? 1

  // Add positions (lines)
  for (const line of lines) {
    // Try to find the catalog item's bexio_article_id
    let bexioArticleId: number | null = null
    if (line.catalog_item_id) {
      const { data: catalogItem } = await supabase
        .from('catalog_items')
        .select('bexio_article_id')
        .eq('id', line.catalog_item_id)
        .single()
      bexioArticleId = catalogItem?.bexio_article_id ?? null
    }

    if (bexioArticleId) {
      await bexio.addInvoicePosition(bexioInvoiceId, {
        articleId: bexioArticleId,
        amount: line.quantity,
        unitPrice: line.unit_price,
        taxId: defaultTaxId,
        text: line.description,
        discount: line.discount,
      })
    }
    // If no bexio_article_id, skip (could add as custom position later)
  }

  // Issue the invoice in Bexio
  try {
    await bexio.issueInvoice(bexioInvoiceId)
  } catch {
    // Non-blocking: invoice created but not issued
  }

  // Update our invoice with bexio IDs
  await supabase
    .from('invoices')
    .update({
      bexio_invoice_id: bexioInvoiceId,
      bexio_synced_at: new Date().toISOString(),
    })
    .eq('id', invoice.id)
}

/**
 * Fetch invoice status from Bexio and update local status
 */
export async function syncInvoiceStatus(invoice: Invoice): Promise<string | null> {
  if (!invoice.bexio_invoice_id) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bexioInvoice = await bexio.getInvoice(invoice.bexio_invoice_id) as any

  // Bexio kb_item_status_id: 7=draft, 8=pending, 9=sent/open, 16=paid, 19=cancelled, 31=partial
  const statusMap: Record<number, 'draft' | 'sent' | 'paid' | 'cancelled'> = {
    7: 'draft',
    8: 'sent',
    9: 'sent',
    16: 'paid',
    19: 'cancelled',
    31: 'sent',
  }

  const bexioStatus = statusMap[bexioInvoice.kb_item_status_id as number] ?? 'draft'

  if (bexioStatus !== invoice.status) {
    await supabase
      .from('invoices')
      .update({ status: bexioStatus, bexio_synced_at: new Date().toISOString() })
      .eq('id', invoice.id)
  }

  return bexioStatus
}

/**
 * Fetch invoice PDF from Bexio
 */
export async function getInvoicePdf(bexioInvoiceId: number): Promise<Blob> {
  return bexio.getInvoicePdf(bexioInvoiceId)
}

/**
 * Send invoice email via Bexio
 */
export async function sendInvoiceEmail(
  bexioInvoiceId: number,
  email: string,
  invoiceNumber: string,
): Promise<void> {
  await bexio.sendInvoice(bexioInvoiceId, {
    email,
    subject: `Facture ${invoiceNumber}`,
    message: `Veuillez trouver ci-joint la facture ${invoiceNumber}. [Network Link]`,
  })
}

/**
 * Mark invoice as paid in Bexio
 */
export async function markInvoicePaid(
  bexioInvoiceId: number,
  amount: number,
): Promise<void> {
  await bexio.addInvoicePayment(bexioInvoiceId, { value: amount })
}
