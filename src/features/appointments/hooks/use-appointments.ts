import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentsService } from '@/services/appointments.service'
import type { AppointmentFormData } from '../schemas/appointment.schema'
import { toast } from 'sonner'

const appointmentKeys = {
  all: ['appointments'] as const,
  ranges: () => [...appointmentKeys.all, 'range'] as const,
  range: (start: string, end: string) => [...appointmentKeys.ranges(), start, end] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
}

export function useAppointmentsByRange(start: string, end: string) {
  return useQuery({
    queryKey: appointmentKeys.range(start, end),
    queryFn: () => appointmentsService.getByDateRange(start, end),
    enabled: !!start && !!end,
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AppointmentFormData) => appointmentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.ranges() })
      toast.success('Rendez-vous créé avec succès')
    },
    onError: () => {
      toast.error('Erreur lors de la création du rendez-vous')
    },
  })
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AppointmentFormData> }) =>
      appointmentsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.ranges() })
      toast.success('Rendez-vous mis à jour')
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du rendez-vous')
    },
  })
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => appointmentsService.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.ranges() })
      toast.success('Rendez-vous supprimé')
    },
    onError: () => {
      toast.error('Erreur lors de la suppression du rendez-vous')
    },
  })
}
