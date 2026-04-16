import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { consultationsService } from '@/services/consultations.service'
import type { ConsultationFormData, ConsultationItemFormData } from '../schemas/consultation.schema'
import { toast } from 'sonner'

const consultationKeys = {
  all: ['consultations'] as const,
  lists: () => [...consultationKeys.all, 'list'] as const,
  list: () => [...consultationKeys.lists()] as const,
  ranges: () => [...consultationKeys.all, 'range'] as const,
  range: (start: string, end: string) => [...consultationKeys.ranges(), start, end] as const,
  details: () => [...consultationKeys.all, 'detail'] as const,
  detail: (id: string) => [...consultationKeys.details(), id] as const,
}

export function useConsultations() {
  return useQuery({
    queryKey: consultationKeys.list(),
    queryFn: () => consultationsService.getAllWithRelations(),
  })
}

export function useConsultationsByRange(start: string, end: string) {
  return useQuery({
    queryKey: consultationKeys.range(start, end),
    queryFn: () => consultationsService.getByDateRange(start, end),
    enabled: !!start && !!end,
  })
}

export function useConsultation(id: string) {
  return useQuery({
    queryKey: consultationKeys.detail(id),
    queryFn: () => consultationsService.getWithItems(id),
    enabled: !!id,
  })
}

export function useCreateConsultation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ConsultationFormData) => {
      const startISO = new Date(data.start_time).toISOString()
      const endISO = new Date(data.end_time).toISOString()
      return consultationsService.create({
        ...data,
        animal_id: data.animal_id ?? undefined,
        start_time: startISO,
        end_time: endISO,
        date: startISO,
      } as any)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: consultationKeys.ranges() })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Consultation créée avec succès')
    },
    onError: () => {
      toast.error('Erreur lors de la création de la consultation')
    },
  })
}

export function useUpdateConsultation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ConsultationFormData> }) =>
      consultationsService.update(id, data as any),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: consultationKeys.ranges() })
      queryClient.invalidateQueries({ queryKey: consultationKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Consultation mise à jour')
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour')
    },
  })
}

export function useDeleteConsultation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => consultationsService.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: consultationKeys.ranges() })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Consultation supprimée')
    },
    onError: () => {
      toast.error('Erreur lors de la suppression')
    },
  })
}

export function useAddConsultationItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ consultationId, data }: { consultationId: string; data: ConsultationItemFormData }) =>
      consultationsService.addItem(consultationId, data),
    onSuccess: (_, { consultationId }) => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.detail(consultationId) })
      toast.success('Article ajouté')
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout de l'article")
    },
  })
}

export function useRemoveConsultationItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId }: { itemId: string; consultationId: string }) =>
      consultationsService.removeItem(itemId),
    onSuccess: (_, { consultationId }) => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.detail(consultationId) })
      toast.success('Article retiré')
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de l'article")
    },
  })
}
