import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { animalsService, uploadAnimalPhoto, deleteAnimalPhoto } from '@/services/animals.service'
import type { AnimalFormData } from '../schemas/animal.schema'
import { toast } from 'sonner'

const animalKeys = {
  all: ['animals'] as const,
  byClient: (clientId: string) => [...animalKeys.all, 'client', clientId] as const,
  details: () => [...animalKeys.all, 'detail'] as const,
  detail: (id: string) => [...animalKeys.details(), id] as const,
}

export function useAnimalsByClient(clientId: string) {
  return useQuery({
    queryKey: animalKeys.byClient(clientId),
    queryFn: () => animalsService.getByClient(clientId),
    enabled: !!clientId,
  })
}

export function useAnimal(id: string) {
  return useQuery({
    queryKey: animalKeys.detail(id),
    queryFn: () => animalsService.getWithClient(id),
    enabled: !!id,
  })
}

export function useCreateAnimal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AnimalFormData) => animalsService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: animalKeys.byClient(variables.client_id) })
      queryClient.invalidateQueries({ queryKey: ['clients', 'detail', variables.client_id] })
      toast.success('Animal ajouté avec succès')
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout de l'animal")
    },
  })
}

export function useUpdateAnimal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AnimalFormData> }) =>
      animalsService.update(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: animalKeys.all })
      queryClient.invalidateQueries({ queryKey: ['clients', 'detail', result.client_id] })
      toast.success('Animal mis à jour')
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour')
    },
  })
}

export function useUploadAnimalPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ animalId, file }: { animalId: string; file: File }) => {
      const publicUrl = await uploadAnimalPhoto(animalId, file)
      await animalsService.update(animalId, { photo_url: publicUrl })
      return publicUrl
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: animalKeys.all })
      toast.success('Photo mise à jour')
    },
    onError: () => {
      toast.error('Erreur lors de l\'upload de la photo')
    },
  })
}

export function useDeleteAnimalPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ animalId, photoUrl }: { animalId: string; photoUrl: string }) =>
      deleteAnimalPhoto(animalId, photoUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: animalKeys.all })
      toast.success('Photo supprimée')
    },
    onError: () => {
      toast.error('Erreur lors de la suppression de la photo')
    },
  })
}

export function useDeleteAnimal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, clientId }: { id: string; clientId: string }) =>
      animalsService.softDelete(id).then(() => clientId),
    onSuccess: (clientId) => {
      queryClient.invalidateQueries({ queryKey: animalKeys.all })
      queryClient.invalidateQueries({ queryKey: ['clients', 'detail', clientId] })
      toast.success('Animal supprimé')
    },
    onError: () => {
      toast.error('Erreur lors de la suppression')
    },
  })
}
