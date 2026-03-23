import { useState, useEffect } from 'react'
import { createArticle, getUnits, getTaxes, getCurrencies, getContacts, getAccounts } from '../services/bexio'

const empty = {
  name: '', code: '', description: '', articleType: '1',
  purchasePrice: '', salePrice: '',
  currencyId: '', accountId: '', expenseAccountId: '',
  unitId: '', taxIncomeId: '', taxExpenseId: '',
  supplierId: '', delivererName: '', delivererCode: '', delivererDescription: '',
  remarks: '', isStock: 'false',
}

export default function Produits() {
  const [form, setForm] = useState(empty)
  const [units, setUnits] = useState([])
  const [taxes, setTaxes] = useState([])
  const [currencies, setCurrencies] = useState([])
  const [contacts, setContacts] = useState([])
  const [accounts, setAccounts] = useState([])
  const [status, setStatus] = useState(null)

  useEffect(() => {
    getUnits().then(setUnits).catch(() => {})
    getTaxes().then(setTaxes).catch(() => {})
    getCurrencies().then(setCurrencies).catch(() => {})
    getContacts().then(setContacts).catch(() => {})
    getAccounts().then(setAccounts).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Envoi...')
    try {
      const result = await createArticle(form)
      setStatus(`Produit créé avec succès (ID: ${result.id})`)
      setForm(empty)
    } catch (err) {
      setStatus(`Erreur: ${err.message}`)
    }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <>
      <header><h1>Nouveau produit</h1></header>
      <form className="form" onSubmit={handleSubmit}>
        <h3 className="form-section" style={{ marginTop: 0, borderTop: 'none' }}>Données de base</h3>
        <div className="form-row">
          <label>
            Type de produit *
            <select value={form.articleType} onChange={update('articleType')}>
              <option value="1">Marchandise</option>
              <option value="2">Service</option>
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>Code produit<input value={form.code} onChange={update('code')} placeholder="ex: ART-001" /></label>
          <label>Désignation produit *<input value={form.name} onChange={update('name')} required /></label>
        </div>
        <div className="form-row">
          <label>Description produit<textarea value={form.description} onChange={update('description')} rows={2} /></label>
        </div>

        <h3 className="form-section">Indications de prix</h3>
        <div className="form-row">
          <label>Prix d'achat<input type="number" step="0.01" value={form.purchasePrice} onChange={update('purchasePrice')} /></label>
          <label>Prix de vente<input type="number" step="0.01" value={form.salePrice} onChange={update('salePrice')} /></label>
        </div>
        <div className="form-row">
          <label>
            Monnaie
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
            Compte de produits
            <select value={form.accountId} onChange={update('accountId')}>
              <option value="">-- Par défaut --</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.account_no} - {a.name}</option>
              ))}
            </select>
          </label>
          <label>
            Compte de charges
            <select value={form.expenseAccountId} onChange={update('expenseAccountId')}>
              <option value="">-- Par défaut --</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.account_no} - {a.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Unité
            <select value={form.unitId} onChange={update('unitId')}>
              <option value="">-- Aucune --</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            TVA chiffre d'affaires
            <select value={form.taxIncomeId} onChange={update('taxIncomeId')}>
              <option value="">-- Par défaut --</option>
              {taxes.map((t) => (
                <option key={t.id} value={t.id}>{t.name || t.display_name} ({t.value || t.percentage}%)</option>
              ))}
            </select>
          </label>
          <label>
            TVA impôt préalable
            <select value={form.taxExpenseId} onChange={update('taxExpenseId')}>
              <option value="">-- Par défaut --</option>
              {taxes.map((t) => (
                <option key={t.id} value={t.id}>{t.name || t.display_name} ({t.value || t.percentage}%)</option>
              ))}
            </select>
          </label>
        </div>

        <h3 className="form-section">Données fournisseur</h3>
        <div className="form-row">
          <label>
            Fournisseur
            <select value={form.supplierId} onChange={update('supplierId')}>
              <option value="">-- Aucun --</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.name_1} {c.name_2}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>Désignation (fournisseur)<input value={form.delivererName} onChange={update('delivererName')} /></label>
          <label>Code (fournisseur)<input value={form.delivererCode} onChange={update('delivererCode')} /></label>
        </div>
        <div className="form-row">
          <label>Description (fournisseur)<textarea value={form.delivererDescription} onChange={update('delivererDescription')} rows={2} /></label>
        </div>

        <h3 className="form-section">Remarques & Stock</h3>
        <div className="form-row">
          <label>Remarques / Notes<textarea value={form.remarks} onChange={update('remarks')} rows={2} /></label>
        </div>
        <div className="form-row">
          <label>
            Gestion des stocks
            <select value={form.isStock} onChange={update('isStock')}>
              <option value="false">Non</option>
              <option value="true">Oui - produit avec stock</option>
            </select>
          </label>
        </div>

        <button type="submit">Créer le produit</button>
        {status && <p className="status">{status}</p>}
      </form>
    </>
  )
}
