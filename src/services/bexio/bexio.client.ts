const BASE_V2 = '/api/bexio/2.0'
const BASE_V3 = '/api/bexio/3.0'

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(endpoint, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Bexio API error ${res.status}: ${error}`)
  }
  return res.json()
}

// Contacts
export function createContact(data: {
  name: string
  firstName?: string
  email?: string
  phone?: string
  address?: string
}) {
  return request(`${BASE_V2}/contact`, {
    method: 'POST',
    body: JSON.stringify({
      contact_type_id: 2,
      name_1: data.name,
      name_2: data.firstName ?? '',
      mail: data.email ?? '',
      phone_fixed: data.phone ?? '',
      user_id: 1,
      owner_id: 1,
    }),
  })
}

export function updateContact(bexioId: number, data: {
  name: string
  firstName?: string
  email?: string
  phone?: string
}) {
  return request(`${BASE_V2}/contact/${bexioId}`, {
    method: 'POST',
    body: JSON.stringify({
      name_1: data.name,
      name_2: data.firstName ?? '',
      mail: data.email ?? '',
      phone_fixed: data.phone ?? '',
    }),
  })
}

export function getContacts() {
  return request<Array<Record<string, unknown>>>(`${BASE_V2}/contact`)
}

export function deleteContact(bexioId: number) {
  return request(`${BASE_V2}/contact/${bexioId}`, { method: 'DELETE' })
}

// Articles
export function createArticle(data: {
  name: string
  type: 'product' | 'service'
  price: number
  unitId?: number
}) {
  return request(`${BASE_V2}/article`, {
    method: 'POST',
    body: JSON.stringify({
      intern_name: data.name,
      article_type_id: data.type === 'product' ? 1 : 2,
      sale_price: String(data.price),
      unit_id: data.unitId ?? null,
      user_id: 1,
    }),
  })
}

export function getArticles() {
  return request<Array<Record<string, unknown>>>(`${BASE_V2}/article`)
}

// Invoices
export function createInvoice(data: {
  contactId: number
  title?: string
  date?: string
  dueDate?: string
}) {
  return request<Record<string, unknown>>(`${BASE_V2}/kb_invoice`, {
    method: 'POST',
    body: JSON.stringify({
      title: data.title ?? null,
      contact_id: data.contactId,
      user_id: 1,
      is_valid_from: data.date ?? new Date().toISOString().split('T')[0],
      is_valid_to: data.dueDate ?? new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      mwst_type: 0,
      mwst_is_net: true,
    }),
  })
}

export function addInvoicePosition(invoiceId: number, data: {
  articleId: number
  amount: number
  unitPrice: number
  taxId: number
  text?: string
  discount?: number
}) {
  return request(`${BASE_V2}/kb_invoice/${invoiceId}/kb_position_article`, {
    method: 'POST',
    body: JSON.stringify({
      article_id: data.articleId,
      amount: String(data.amount),
      unit_price: String(data.unitPrice),
      tax_id: data.taxId,
      text: data.text ?? '',
      discount_in_percent: String(data.discount ?? 0),
    }),
  })
}

export function issueInvoice(invoiceId: number) {
  return request(`${BASE_V2}/kb_invoice/${invoiceId}/issue`, { method: 'POST' })
}

export function sendInvoice(invoiceId: number, data: {
  email: string
  subject: string
  message: string
}) {
  return request(`${BASE_V2}/kb_invoice/${invoiceId}/send`, {
    method: 'POST',
    body: JSON.stringify({
      recipient_email: data.email,
      subject: data.subject,
      message: data.message,
      mark_as_open: true,
      attach_pdf: true,
    }),
  })
}

export function getInvoices() {
  return request<Array<Record<string, unknown>>>(`${BASE_V2}/kb_invoice`)
}

export function getInvoice(id: number) {
  return request<Record<string, unknown>>(`${BASE_V2}/kb_invoice/${id}`)
}

export async function getInvoicePdf(id: number): Promise<Blob> {
  const data = await request<{ content: string }>(`${BASE_V2}/kb_invoice/${id}/pdf`)
  const byteChars = atob(data.content)
  const bytes = new Uint8Array(byteChars.length)
  for (let i = 0; i < byteChars.length; i++) {
    bytes[i] = byteChars.charCodeAt(i)
  }
  return new Blob([bytes], { type: 'application/pdf' })
}

export function addInvoicePayment(invoiceId: number, data: {
  value: number
  date?: string
  bankAccountId?: number
}) {
  return request(`${BASE_V2}/kb_invoice/${invoiceId}/payment`, {
    method: 'POST',
    body: JSON.stringify({
      value: String(data.value),
      date: data.date ?? new Date().toISOString().split('T')[0],
      bank_account_id: data.bankAccountId,
    }),
  })
}

// Reference data
export function getAccounts() {
  return request<Array<Record<string, unknown>>>(`${BASE_V2}/accounts`)
}

export function getUnits() {
  return request<Array<Record<string, unknown>>>(`${BASE_V2}/unit`)
}

export function getPaymentTypes() {
  return request<Array<Record<string, unknown>>>(`${BASE_V2}/payment_type`)
}

export function getBankAccounts() {
  return request<Array<Record<string, unknown>>>(`${BASE_V3}/banking/accounts`)
}

export function getCurrencies() {
  return request<Array<Record<string, unknown>>>(`${BASE_V3}/currencies`)
}

export function getTaxes() {
  return request<Array<Record<string, unknown>>>(`${BASE_V3}/taxes?types=sales_tax&scope=active`)
}
