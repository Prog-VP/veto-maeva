import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicesService, type Invoice } from '@/services/invoices.service'
import { syncInvoice, markInvoicePaid, syncInvoiceStatus } from '@/services/bexio/bexio-sync.service'
import type { InvoiceFormData } from '../schemas/invoice.schema'
import { toast } from 'sonner'

const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: () => [...invoiceKeys.lists()] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
}

function bexioSyncInvoice(invoice: Invoice) {
  // Fetch lines then sync
  invoicesService.getWithLines(invoice.id).then((full) => {
    syncInvoice(invoice, full.invoice_lines).catch(() => {
      toast.warning('Facture créée localement mais la sync Bexio a échoué')
    })
  }).catch(() => {
    toast.warning('Impossible de récupérer les lignes pour la sync Bexio')
  })
}

export function useInvoices() {
  return useQuery({
    queryKey: invoiceKeys.list(),
    queryFn: () => invoicesService.getAllWithClients(),
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoicesService.getWithLines(id),
    enabled: !!id,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InvoiceFormData) => invoicesService.create(data),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      toast.success('Facture créée avec succès')
      bexioSyncInvoice(invoice)
    },
    onError: () => {
      toast.error('Erreur lors de la création de la facture')
    },
  })
}

export function useCreateInvoiceFromConsultation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (consultationId: string) => invoicesService.createFromConsultation(consultationId),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      toast.success('Facture créée depuis la consultation')
      bexioSyncInvoice(invoice)
    },
    onError: () => {
      toast.error('Erreur lors de la création de la facture')
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InvoiceFormData> & { status?: string } }) =>
      invoicesService.update(id, data),
    onSuccess: (invoice, { id }) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) })
      toast.success('Facture mise à jour')

      // If marked as paid, sync payment to Bexio
      if (invoice.status === 'paid' && invoice.bexio_invoice_id) {
        markInvoicePaid(invoice.bexio_invoice_id, invoice.total_ttc).catch(() => {
          toast.warning('Facture marquée payée localement mais la sync Bexio a échoué')
        })
      }
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour')
    },
  })
}

export function useSyncInvoiceStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (invoice: Invoice) => syncInvoiceStatus(invoice),
    onSuccess: (status, invoice) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(invoice.id) })
      if (status) {
        toast.success(`Statut Bexio synchronisé : ${status}`)
      }
    },
    onError: () => {
      toast.error('Erreur lors de la synchronisation du statut Bexio')
    },
  })
}

export function useSyncInvoicesFromBexio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => invoicesService.syncFromBexio(),
    onSuccess: ({ created, updated, deleted }) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
      toast.success(`Factures synchronisées : ${created} créée(s), ${updated} mise(s) à jour, ${deleted} supprimée(s)`)
    },
    onError: () => {
      toast.error('Erreur lors de la synchronisation avec Bexio')
    },
  })
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => invoicesService.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      toast.success('Facture supprimée')
    },
    onError: () => {
      toast.error('Erreur lors de la suppression')
    },
  })
}
