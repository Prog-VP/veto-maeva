import { useState, useEffect } from 'react'
import { createInvoice, getContacts, getBankAccounts, getCurrencies, getPaymentTypes } from '../services/bexio'

const today = () => new Date().toISOString().split('T')[0]
const in30days = () => new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

const empty = {
  title: '', contactId: '', date: today(), dueDate: in30days(),
  mwstType: '0', mwstIsNet: 'true', showPositionTaxes: 'false',
  header: '', footer: '',
  bankAccountId: '', currencyId: '', paymentTypeId: '',
  apiReference: '',
}

export default function Factures() {
  const [contacts, setContacts] = useState([])
  const [bankAccounts, setBankAccounts] = useState([])
  const [currencies, setCurrencies] = useState([])
  const [paymentTypes, setPaymentTypes] = useState([])
  const [form, setForm] = useState(empty)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    getContacts().then(setContacts).catch(() => {})
    getBankAccounts().then(setBankAccounts).catch(() => {})
    getCurrencies().then(setCurrencies).catch(() => {})
    getPaymentTypes().then(setPaymentTypes).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Envoi...')
    try {
      const result = await createInvoice(form)
      setStatus(`Facture créée avec succès (ID: ${result.id}, N°: ${result.document_nr})`)
      setForm({ ...empty, date: today(), dueDate: in30days() })
    } catch (err) {
      setStatus(`Erreur: ${err.message}`)
    }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <>
      <header><h1>Nouvelle facture</h1></header>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Titre<input value={form.title} onChange={update('title')} /></label>
        </div>
        <div className="form-row">
          <label>
            Client *
            <select value={form.contactId} onChange={update('contactId')} required>
              <option value="">-- Sélectionner --</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.name_1} {c.name_2}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>Date<input type="date" value={form.date} onChange={update('date')} /></label>
          <label>Échéance<input type="date" value={form.dueDate} onChange={update('dueDate')} /></label>
        </div>

        <h3 className="form-section">Paramètres TVA</h3>
        <div className="form-row">
          <label>
            Type TVA
            <select value={form.mwstType} onChange={update('mwstType')}>
              <option value="0">TTC (taxes incluses)</option>
              <option value="1">HT (taxes exclues)</option>
              <option value="2">Exonéré</option>
            </select>
          </label>
          <label>
            Calcul TVA
            <select value={form.mwstIsNet} onChange={update('mwstIsNet')}>
              <option value="true">Taxes en sus des prix</option>
              <option value="false">Taxes incluses dans les prix</option>
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Afficher TVA par position
            <select value={form.showPositionTaxes} onChange={update('showPositionTaxes')}>
              <option value="false">Non</option>
              <option value="true">Oui</option>
            </select>
          </label>
        </div>

        <h3 className="form-section">Paiement & Devise</h3>
        <div className="form-row">
          <label>
            Compte bancaire
            <select value={form.bankAccountId} onChange={update('bankAccountId')}>
              <option value="">-- Par défaut --</option>
              {bankAccounts.map((b) => (
                <option key={b.id} value={b.id}>{b.name || b.iban || `Compte ${b.id}`}</option>
              ))}
            </select>
          </label>
          <label>
            Devise
            <select value={form.currencyId} onChange={update('currencyId')}>
              <option value="">-- Par défaut --</option>
              {currencies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Mode de paiement
            <select value={form.paymentTypeId} onChange={update('paymentTypeId')}>
              <option value="">-- Par défaut --</option>
              {paymentTypes.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
        </div>

        <h3 className="form-section">Textes</h3>
        <div className="form-row">
          <label>En-tête<textarea value={form.header} onChange={update('header')} rows={2} /></label>
        </div>
        <div className="form-row">
          <label>Pied de page<textarea value={form.footer} onChange={update('footer')} rows={2} /></label>
        </div>
        <div className="form-row">
          <label>Référence API<input value={form.apiReference} onChange={update('apiReference')} placeholder="Référence externe" /></label>
        </div>

        <button type="submit">Créer la facture</button>
        {status && <p className="status">{status}</p>}
      </form>
    </>
  )
}
