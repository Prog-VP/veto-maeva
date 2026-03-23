const BASE = '/api/bexio/2.0'

async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Bexio API error ${res.status}: ${error}`)
  }
  return res.json()
}

export function createContact(data) {
  return request('/contact', {
    method: 'POST',
    body: JSON.stringify({
      contact_type_id: 1,
      name_1: data.name,
      name_2: data.firstName || '',
      postcode: data.postcode || '',
      city: data.city || '',
      country_id: 1,
      mail: data.email || '',
      phone_fixed: data.phone || '',
      user_id: 1,
      owner_id: 1,
    }),
  })
}

export function createArticle(data) {
  const body = {
    intern_name: data.name,
    intern_code: data.code || '',
    intern_description: data.description || '',
    sale_price: data.salePrice || '0',
    purchase_price: data.purchasePrice || '0',
    article_type_id: parseInt(data.articleType) || 1,
    unit_id: data.unitId ? parseInt(data.unitId) : null,
    account_id: data.accountId ? parseInt(data.accountId) : null,
    expense_account_id: data.expenseAccountId ? parseInt(data.expenseAccountId) : null,
    currency_id: data.currencyId ? parseInt(data.currencyId) : null,
    tax_income_id: data.taxIncomeId ? parseInt(data.taxIncomeId) : null,
    tax_expense_id: data.taxExpenseId ? parseInt(data.taxExpenseId) : null,
    contact_id: data.supplierId ? parseInt(data.supplierId) : null,
    deliverer_name: data.delivererName || '',
    deliverer_code: data.delivererCode || '',
    deliverer_description: data.delivererDescription || '',
    article_group_id: data.articleGroupId ? parseInt(data.articleGroupId) : null,
    remarks: data.remarks || '',
    is_stock: data.isStock === 'true',
    user_id: 1,
  }
  return request('/article', { method: 'POST', body: JSON.stringify(body) })
}

export function getAccounts() {
  return request('/accounts')
}

export function getUnits() {
  return request('/unit')
}

export function createInvoice(data) {
  const body = {
    title: data.title || null,
    contact_id: parseInt(data.contactId),
    contact_sub_id: data.contactSubId ? parseInt(data.contactSubId) : null,
    user_id: 1,
    is_valid_from: data.date || new Date().toISOString().split('T')[0],
    is_valid_to: data.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    mwst_type: parseInt(data.mwstType) || 0,
    mwst_is_net: data.mwstIsNet !== 'false',
    show_position_taxes: data.showPositionTaxes === 'true',
    header: data.header || '',
    footer: data.footer || '',
    api_reference: data.apiReference || '',
    bank_account_id: data.bankAccountId ? parseInt(data.bankAccountId) : undefined,
    currency_id: data.currencyId ? parseInt(data.currencyId) : undefined,
    payment_type_id: data.paymentTypeId ? parseInt(data.paymentTypeId) : undefined,
  }
  Object.keys(body).forEach((k) => body[k] === undefined && delete body[k])
  return request('/kb_invoice', { method: 'POST', body: JSON.stringify(body) })
}

export function getBankAccounts() {
  return fetch('/api/bexio/3.0/banking/accounts', {
    headers: { 'Content-Type': 'application/json' },
  }).then((r) => { if (!r.ok) throw new Error('Erreur'); return r.json() })
}

export function getCurrencies() {
  return fetch('/api/bexio/3.0/currencies', {
    headers: { 'Content-Type': 'application/json' },
  }).then((r) => { if (!r.ok) throw new Error('Erreur'); return r.json() })
}

export function getPaymentTypes() {
  return request('/payment_type')
}

export function getContacts() {
  return request('/contact')
}

export function getArticles() {
  return request('/article')
}

export function getInvoices() {
  return request('/kb_invoice')
}

export function getTaxes() {
  return fetch('/api/bexio/3.0/taxes?types=sales_tax&scope=active', {
    headers: { 'Content-Type': 'application/json' },
  }).then((res) => {
    if (!res.ok) throw new Error('Erreur chargement taxes')
    return res.json()
  })
}

export function addInvoicePosition(invoiceId, data) {
  return request(`/kb_invoice/${invoiceId}/kb_position_article`, {
    method: 'POST',
    body: JSON.stringify({
      article_id: parseInt(data.articleId),
      amount: data.amount || '1.000000',
      unit_price: data.unitPrice || '0.000000',
      tax_id: parseInt(data.taxId),
      text: data.text || '',
      discount_in_percent: data.discount || '0.000000',
    }),
  })
}

export async function getInvoicePdf(id) {
  const data = await request(`/kb_invoice/${id}/pdf`)
  const byteChars = atob(data.content)
  const bytes = new Uint8Array(byteChars.length)
  for (let i = 0; i < byteChars.length; i++) {
    bytes[i] = byteChars.charCodeAt(i)
  }
  return new Blob([bytes], { type: 'application/pdf' })
}
