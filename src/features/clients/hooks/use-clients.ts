import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientsService, type Client } from '@/services/clients.service'
import { syncClient } from '@/services/bexio/bexio-sync.service'
import { deleteContact as deleteBexioContact } from '@/services/bexio/bexio.client'
import type { ClientFormData } from '../schemas/client.schema'
import { toast } from 'sonner'

const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (search: string) => [...clientKeys.lists(), search] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
}

function bexioSync(client: Client) {
  syncClient(client).catch(() => {
    toast.warning('Client créé localement mais la sync Bexio a échoué')
  })
}

export function useClients(search: string = '') {
  return useQuery({
    queryKey: clientKeys.list(search),
    queryFn: () =>
      search
        ? clientsService.searchByName(search)
        : clientsService.getAll({ orderBy: 'last_name', ascending: true }),
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientsService.getWithAnimals(id),
    enabled: !!id,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ClientFormData) => clientsService.create(data),
    onSuccess: (client) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
      toast.success('Client créé avec succès')
      bexioSync(client)
    },
    onError: () => {
      toast.error('Erreur lors de la création du client')
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientFormData> }) =>
      clientsService.update(id, data),
    onSuccess: (client, { id }) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(id) })
      toast.success('Client mis à jour')
      bexioSync(client)
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour')
    },
  })
}

export function useSyncClientsFromBexio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => clientsService.syncFromBexio(),
    onSuccess: ({ created, updated, deleted }) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all })
      toast.success(`Clients synchronisés : ${created} créé(s), ${updated} mis à jour, ${deleted} supprimé(s)`)
    },
    onError: () => {
      toast.error('Erreur lors de la synchronisation avec Bexio')
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, bexioContactId }: { id: string; bexioContactId: number | null }) => {
      await clientsService.softDelete(id)
      if (bexioContactId) {
        try {
          await deleteBexioContact(bexioContactId)
        } catch {
          // Non-blocking: local delete succeeded, Bexio delete failed
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
      toast.success('Client supprimé')
    },
    onError: () => {
      toast.error('Erreur lors de la suppression')
    },
  })
}
