import { useState, useEffect } from 'react'
import { getInvoices, getInvoicePdf } from '../services/bexio'

export default function ListeFactures() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getInvoices()
      .then(setInvoices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const openPdf = async (id) => {
    try {
      const blob = await getInvoicePdf(id)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (err) {
      alert(`Erreur PDF: ${err.message}`)
    }
  }

  if (loading) return <p>Chargement...</p>
  if (error) return <p className="status">Erreur: {error}</p>

  return (
    <>
      <header><h1>Factures</h1></header>
      {invoices.length === 0 ? (
        <p>Aucune facture trouvée.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Titre</th>
              <th>Date</th>
              <th>Échéance</th>
              <th>Total</th>
              <th>Statut</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.document_nr}</td>
                <td>{inv.title}</td>
                <td>{inv.is_valid_from}</td>
                <td>{inv.is_valid_to}</td>
                <td>{inv.total_gross ?? inv.total ?? '-'} {inv.currency_id === 1 ? 'CHF' : ''}</td>
                <td>
                  <span className={`badge badge-${inv.kb_item_status_id}`}>
                    {statusLabel(inv.kb_item_status_id)}
                  </span>
                </td>
                <td>
                  <button className="btn-pdf" onClick={() => openPdf(inv.id)}>PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

function statusLabel(id) {
  const labels = {
    7: 'Brouillon',
    8: 'En attente',
    9: 'Envoyée',
    16: 'Payée',
    19: 'Partiellement payée',
    31: 'Annulée',
  }
  return labels[id] || `Statut ${id}`
}
