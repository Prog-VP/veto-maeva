import { useNavigate } from 'react-router-dom'
import { FileText, Search, MoreHorizontal, Trash2, Eye, RefreshCw } from 'lucide-react'
import { useInvoices, useDeleteInvoice, useSyncInvoicesFromBexio } from '../hooks/use-invoices'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '@/lib/constants'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { useState, useMemo } from 'react'

export default function InvoicesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useSearchParamsState('q')
  const [statusFilter, setStatusFilter] = useSearchParamsState('status')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useInvoices()
  const deleteInvoice = useDeleteInvoice()
  const syncBexio = useSyncInvoicesFromBexio()

  const invoices = useMemo(() => {
    let list = data?.data ?? []

    if (statusFilter) {
      list = list.filter((inv) => inv.status === statusFilter)
    }

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (inv) =>
          inv.invoice_number?.toLowerCase().includes(q) ||
          `${inv.clients.last_name} ${inv.clients.first_name}`.toLowerCase().includes(q),
      )
    }

    return list
  }, [data, statusFilter, search])

  function handleDelete() {
    if (deleteId) {
      deleteInvoice.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      })
    }
  }

  return (
    <div>
      <PageHeader
        title="Factures"
        description={`${data?.count ?? 0} facture${(data?.count ?? 0) > 1 ? 's' : ''}`}
        action={
          <Button variant="outline" onClick={() => syncBexio.mutate()} disabled={syncBexio.isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncBexio.isPending ? 'animate-spin' : ''}`} />
            {syncBexio.isPending ? 'Sync...' : 'Importer Bexio'}
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par n° ou client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Tous les statuts</option>
          <option value="draft">Brouillon</option>
          <option value="sent">Envoyée</option>
          <option value="paid">Payée</option>
          <option value="cancelled">Annulée</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucune facture"
          description={
            search || statusFilter
              ? 'Aucun résultat pour ces critères'
              : 'Aucune facture pour le moment'
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Facture</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total TTC</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/factures/${invoice.id}`)}
                >
                  <TableCell className="font-medium">
                    {invoice.invoice_number ?? '-'}
                  </TableCell>
                  <TableCell>
                    {invoice.clients.last_name} {invoice.clients.first_name}
                  </TableCell>
                  <TableCell>{formatDate(invoice.date)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.total_ttc)}</TableCell>
                  <TableCell>
                    <StatusBadge
                      label={INVOICE_STATUS_LABELS[invoice.status]}
                      colorClass={INVOICE_STATUS_COLORS[invoice.status]}
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent"
                        onClick={(e) => e.stopPropagation()}
                        render={<button />}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/factures/${invoice.id}`) }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => { e.stopPropagation(); setDeleteId(invoice.id) }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Supprimer la facture"
        description="Cette action est irréversible. La facture sera supprimée."
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
