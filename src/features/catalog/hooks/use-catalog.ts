import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { catalogService } from '@/services/catalog.service'
import { toast } from 'sonner'

const catalogKeys = {
  all: ['catalog'] as const,
  lists: () => [...catalogKeys.all, 'list'] as const,
  list: (type: 'product' | 'service', search: string) => [...catalogKeys.lists(), type, search] as const,
  details: () => [...catalogKeys.all, 'detail'] as const,
  detail: (id: string) => [...catalogKeys.details(), id] as const,
}

export function useCatalogItems(type: 'product' | 'service', search: string = '') {
  return useQuery({
    queryKey: catalogKeys.list(type, search),
    queryFn: () => catalogService.getByType(type, search),
  })
}

export function useCatalogItem(id: string) {
  return useQuery({
    queryKey: catalogKeys.detail(id),
    queryFn: () => catalogService.getById(id),
    enabled: !!id,
  })
}

export function useSyncCatalogFromBexio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => catalogService.syncFromBexio(),
    onSuccess: ({ created, updated, deleted }) => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all })
      queryClient.invalidateQueries({ queryKey: ['stock'] })
      toast.success(`Catalogue synchronisé : ${created} créé(s), ${updated} mis à jour, ${deleted} supprimé(s)`)
    },
    onError: () => {
      toast.error('Erreur lors de la synchronisation avec Bexio')
    },
  })
}
