import { useState } from 'react'
import { createContact } from '../services/bexio'

export default function Clients() {
  const [form, setForm] = useState({ name: '', firstName: '', email: '', phone: '', postcode: '', city: '' })
  const [status, setStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Envoi...')
    try {
      const result = await createContact(form)
      setStatus(`Client créé avec succès (ID: ${result.id})`)
      setForm({ name: '', firstName: '', email: '', phone: '', postcode: '', city: '' })
    } catch (err) {
      setStatus(`Erreur: ${err.message}`)
    }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <>
      <header><h1>Nouveau client</h1></header>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Nom *<input value={form.name} onChange={update('name')} required /></label>
          <label>Prénom<input value={form.firstName} onChange={update('firstName')} /></label>
        </div>
        <div className="form-row">
          <label>Email<input type="email" value={form.email} onChange={update('email')} /></label>
          <label>Téléphone<input value={form.phone} onChange={update('phone')} /></label>
        </div>
        <div className="form-row">
          <label>Code postal<input value={form.postcode} onChange={update('postcode')} /></label>
          <label>Ville<input value={form.city} onChange={update('city')} /></label>
        </div>
        <button type="submit">Créer le client</button>
        {status && <p className="status">{status}</p>}
      </form>
    </>
  )
}
