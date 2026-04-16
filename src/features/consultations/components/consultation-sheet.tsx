import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { consultationSchema, type ConsultationFormData } from '../schemas/consultation.schema'
import { useCreateConsultation, useUpdateConsultation, useDeleteConsultation } from '../hooks/use-consultations'
import { clientsService } from '@/services/clients.service'
import { animalsService } from '@/services/animals.service'
import type { ConsultationWithRelations } from '@/services/consultations.service'

interface ConsultationSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consultation?: ConsultationWithRelations
  defaultStart?: string
  defaultEnd?: string
}

function toDatetimeLocal(iso: string): string {
  const date = new Date(iso)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

export function ConsultationSheet({
  open,
  onOpenChange,
  consultation,
  defaultStart,
  defaultEnd,
}: ConsultationSheetProps) {
  const isEdit = !!consultation
  const createConsultation = useCreateConsultation()
  const updateConsultation = useUpdateConsultation()
  const deleteConsultation = useDeleteConsultation()

  const { data: clientsData } = useQuery({
    queryKey: ['clients', 'list-all'],
    queryFn: () => clientsService.getAll({ orderBy: 'last_name', ascending: true, pageSize: 500 }),
    enabled: open,
  })

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema) as any,
    defaultValues: {
      client_id: '',
      animal_id: null,
      start_time: '',
      end_time: '',
      reason: null,
      status: 'scheduled',
      color: '#f97316',
      examination: null,
      diagnosis: null,
      treatment_plan: null,
      notes: null,
    },
  })

  const selectedClientId = watch('client_id')

  const { data: animals } = useQuery({
    queryKey: ['animals', 'client', selectedClientId],
    queryFn: () => animalsService.getByClient(selectedClientId),
    enabled: !!selectedClientId,
  })

  useEffect(() => {
    if (!open) return

    if (consultation) {
      reset({
        client_id: consultation.client_id ?? '',
        animal_id: consultation.animal_id,
        start_time: consultation.start_time ? toDatetimeLocal(consultation.start_time) : '',
        end_time: consultation.end_time ? toDatetimeLocal(consultation.end_time) : '',
        reason: consultation.reason,
        status: consultation.status,
        color: consultation.color,
        examination: consultation.examination,
        diagnosis: consultation.diagnosis,
        treatment_plan: consultation.treatment_plan,
        notes: consultation.notes,
      })
    } else {
      reset({
        client_id: '',
        animal_id: null,
        start_time: defaultStart ? toDatetimeLocal(defaultStart) : '',
        end_time: defaultEnd ? toDatetimeLocal(defaultEnd) : '',
        reason: null,
        status: 'scheduled',
        color: '#f97316',
        examination: null,
        diagnosis: null,
        treatment_plan: null,
        notes: null,
      })
    }
  }, [open, consultation, defaultStart, defaultEnd, reset])

  // Reset animal when client changes (only if user changes it, not on initial load)
  useEffect(() => {
    if (!consultation || selectedClientId !== consultation.client_id) {
      setValue('animal_id', null)
    }
  }, [selectedClientId, setValue, consultation])

  const onSubmit = (data: ConsultationFormData) => {
    const payload = {
      ...data,
      start_time: new Date(data.start_time).toISOString(),
      end_time: new Date(data.end_time).toISOString(),
      date: new Date(data.start_time).toISOString(),
    }

    if (isEdit) {
      updateConsultation.mutate(
        { id: consultation.id, data: payload },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      createConsultation.mutate(payload as any, {
        onSuccess: () => onOpenChange(false),
      })
    }
  }

  const isPending = createConsultation.isPending || updateConsultation.isPending
  const clients = clientsData?.data ?? []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>{isEdit ? 'Modifier la consultation' : 'Nouvelle consultation'}</SheetTitle>
        </SheetHeader>
        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Client */}
            <div className="space-y-2">
              <Label htmlFor="client_id">Client *</Label>
              <select
                id="client_id"
                {...register('client_id')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Sélectionner un client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.last_name} {c.first_name}
                  </option>
                ))}
              </select>
              {errors.client_id && (
                <p className="text-sm text-destructive">{errors.client_id.message}</p>
              )}
            </div>

            {/* Animal */}
            <div className="space-y-2">
              <Label htmlFor="animal_id">Animal</Label>
              <select
                id="animal_id"
                {...register('animal_id')}
                disabled={!selectedClientId}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              >
                <option value="">Aucun animal</option>
                {(animals ?? []).map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.species})
                  </option>
                ))}
              </select>
            </div>

            {/* Start time */}
            <div className="space-y-2">
              <Label htmlFor="start_time">Début *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                {...register('start_time', {
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    const start = e.target.value
                    if (start) {
                      const end = new Date(new Date(start).getTime() + 60 * 60 * 1000)
                      const offset = end.getTimezoneOffset()
                      const local = new Date(end.getTime() - offset * 60000)
                      setValue('end_time', local.toISOString().slice(0, 16))
                    }
                  },
                })}
              />
              {errors.start_time && (
                <p className="text-sm text-destructive">{errors.start_time.message}</p>
              )}
            </div>

            {/* End time */}
            <div className="space-y-2">
              <Label htmlFor="end_time">Fin *</Label>
              <Input
                id="end_time"
                type="datetime-local"
                {...register('end_time')}
              />
              {errors.end_time && (
                <p className="text-sm text-destructive">{errors.end_time.message}</p>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Motif</Label>
              <Input
                id="reason"
                placeholder="Motif de la consultation"
                {...register('reason')}
              />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="color">Couleur</Label>
              <Input
                id="color"
                type="color"
                {...register('color')}
                className="h-9 w-16 p-1 cursor-pointer"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Notes supplémentaires"
                rows={3}
                {...register('notes')}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-between pt-4">
              {isEdit ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Supprimer cette consultation ?')) {
                      deleteConsultation.mutate(consultation.id, {
                        onSuccess: () => onOpenChange(false),
                      })
                    }
                  }}
                  disabled={deleteConsultation.isPending}
                >
                  {deleteConsultation.isPending ? 'Suppression...' : 'Supprimer'}
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
