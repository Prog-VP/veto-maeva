import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, CheckCircle, FileDown, Loader2, RefreshCw } from 'lucide-react'
import { useInvoice, useUpdateInvoice, useSyncInvoiceStatus } from '../hooks/use-invoices'
import { getInvoicePdf } from '@/services/bexio/bexio-sync.service'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '@/lib/constants'

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const navigate = useNavigate()

  const { data: invoice, isLoading } = useInvoice(invoiceId!)
  const updateInvoice = useUpdateInvoice()
  const syncStatus = useSyncInvoiceStatus()
  const [pdfLoading, setPdfLoading] = useState(false)

  function handleStatusChange(newStatus: 'sent' | 'paid') {
    updateInvoice.mutate({ id: invoiceId!, data: { status: newStatus } })
  }

  const handleDownloadPdf = useCallback(async () => {
    if (!invoice?.bexio_invoice_id) {
      toast.error('Facture non synchronisée avec Bexio')
      return
    }
    setPdfLoading(true)
    try {
      const blob = await getInvoicePdf(invoice.bexio_invoice_id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facture-${invoice.invoice_number}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Erreur lors du téléchargement du PDF')
    } finally {
      setPdfLoading(false)
    }
  }, [invoice])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!invoice) {
    return <p className="text-muted-foreground">Facture non trouvée</p>
  }

  function computeLineTotal(line: { quantity: number; unit_price: number; discount: number; tax_rate: number }) {
    const ht = line.quantity * line.unit_price * (1 - line.discount / 100)
    const tax = ht * (line.tax_rate / 100)
    return ht + tax
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/factures')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {invoice.invoice_number ?? 'Facture'}
            </h1>
            <StatusBadge
              label={INVOICE_STATUS_LABELS[invoice.status]}
              colorClass={INVOICE_STATUS_COLORS[invoice.status]}
            />
          </div>
          <p className="text-muted-foreground">
            {invoice.clients.last_name} {invoice.clients.first_name}
            {' — '}
            {formatDate(invoice.date)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {invoice.bexio_invoice_id && (
            <>
              <Button
                variant="outline"
                onClick={() => syncStatus.mutate(invoice)}
                disabled={syncStatus.isPending}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus.isPending ? 'animate-spin' : ''}`} />
                Sync Bexio
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
              >
                {pdfLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4 mr-2" />
                )}
                PDF
              </Button>
            </>
          )}
          {invoice.status === 'draft' && (
            <Button
              variant="outline"
              onClick={() => handleStatusChange('sent')}
              disabled={updateInvoice.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              Marquer envoyée
            </Button>
          )}
          {invoice.status === 'sent' && (
            <Button
              onClick={() => handleStatusChange('paid')}
              disabled={updateInvoice.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Marquer payée
            </Button>
          )}
        </div>
      </div>

      {/* Invoice info card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Client</dt>
              <dd className="font-medium">
                {invoice.clients.first_name} {invoice.clients.last_name}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd>{invoice.clients.email ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Date</dt>
              <dd>{formatDate(invoice.date)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Statut</dt>
              <dd>
                <StatusBadge
                  label={INVOICE_STATUS_LABELS[invoice.status]}
                  colorClass={INVOICE_STATUS_COLORS[invoice.status]}
                />
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Lines table */}
      <Card>
        <CardHeader>
          <CardTitle>Lignes de facture</CardTitle>
        </CardHeader>
        <CardContent>
          {invoice.invoice_lines.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucune ligne de facture
            </p>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Prix unitaire</TableHead>
                      <TableHead className="text-right">TVA (%)</TableHead>
                      <TableHead className="text-right">Remise (%)</TableHead>
                      <TableHead className="text-right">Total ligne</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.invoice_lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>{line.description}</TableCell>
                        <TableCell className="text-right">{line.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(line.unit_price)}</TableCell>
                        <TableCell className="text-right">{line.tax_rate}%</TableCell>
                        <TableCell className="text-right">{line.discount}%</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(computeLineTotal(line))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <Separator className="my-4" />
              <div className="flex justify-end">
                <dl className="space-y-2 text-sm w-64">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total HT</dt>
                    <dd className="font-medium">{formatCurrency(invoice.total_ht)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">TVA</dt>
                    <dd className="font-medium">{formatCurrency(invoice.total_tax)}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base">
                    <dt className="font-semibold">Total TTC</dt>
                    <dd className="font-bold">{formatCurrency(invoice.total_ttc)}</dd>
                  </div>
                </dl>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
