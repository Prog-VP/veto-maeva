import { useState, useEffect } from 'react'
import { getInvoices, getArticles, getTaxes, addInvoicePosition } from '../services/bexio'

export default function AjouterPosition() {
  const [invoices, setInvoices] = useState([])
  const [articles, setArticles] = useState([])
  const [taxes, setTaxes] = useState([])
  const [form, setForm] = useState({ invoiceId: '', articleId: '', amount: '1', unitPrice: '', taxId: '', text: '', discount: '0' })
  const [status, setStatus] = useState(null)

  useEffect(() => {
    getInvoices().then(setInvoices).catch(() => {})
    getArticles().then(setArticles).catch(() => {})
    getTaxes().then(setTaxes).catch(() => {})
  }, [])

  const onArticleChange = (e) => {
    const id = e.target.value
    const article = articles.find((a) => String(a.id) === id)
    setForm({
      ...form,
      articleId: id,
      text: article?.intern_name || '',
      unitPrice: article?.sale_price || '',
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Envoi...')
    try {
      const result = await addInvoicePosition(form.invoiceId, form)
      setStatus(`Position ajoutée (ID: ${result.id}, total: ${result.position_total})`)
    } catch (err) {
      setStatus(`Erreur: ${err.message}`)
    }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <>
      <header><h1>Ajouter un produit à une facture</h1></header>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Facture *
            <select value={form.invoiceId} onChange={update('invoiceId')} required>
              <option value="">-- Sélectionner --</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>{inv.document_nr} - {inv.title}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Produit *
            <select value={form.articleId} onChange={onArticleChange} required>
              <option value="">-- Sélectionner --</option>
              {articles.map((a) => (
                <option key={a.id} value={a.id}>{a.intern_name}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>Description<input value={form.text} onChange={update('text')} /></label>
        </div>
        <div className="form-row">
          <label>Quantité *<input type="number" step="0.01" value={form.amount} onChange={update('amount')} required /></label>
          <label>Prix unitaire *<input type="number" step="0.01" value={form.unitPrice} onChange={update('unitPrice')} required /></label>
        </div>
        <div className="form-row">
          <label>
            TVA *
            <select value={form.taxId} onChange={update('taxId')} required>
              <option value="">-- Sélectionner --</option>
              {taxes.map((t) => (
                <option key={t.id} value={t.id}>{t.name || t.display_name} ({t.value || t.percentage}%)</option>
              ))}
            </select>
          </label>
          <label>Rabais (%)<input type="number" step="0.01" value={form.discount} onChange={update('discount')} /></label>
        </div>
        <button type="submit">Ajouter à la facture</button>
        {status && <p className="status">{status}</p>}
      </form>
    </>
  )
}
