import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CheckCircle2, FileText } from 'lucide-react'
import { useConsultation, useUpdateConsultation } from '../hooks/use-consultations'
import { useCreateInvoiceFromConsultation } from '@/features/invoices/hooks/use-invoices'
import { consultationSchema, type ConsultationFormData } from '../schemas/consultation.schema'
import { ConsultationItemsTable } from '../components/consultation-items-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { CONSULTATION_STATUS_LABELS, CONSULTATION_STATUS_COLORS } from '@/lib/constants'
import { formatDateTime } from '@/lib/utils'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { toast } from 'sonner'

export default function ConsultationDetailPage() {
  const { consultationId } = useParams<{ consultationId: string }>()
  const navigate = useNavigate()
  const [confirmClose, setConfirmClose] = useState(false)

  const { data: consultation, isLoading } = useConsultation(consultationId!)
  const updateConsultation = useUpdateConsultation()
  const createInvoice = useCreateInvoiceFromConsultation()

  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema) as any,
    values: consultation ? {
      client_id: consultation.client_id ?? '',
      animal_id: consultation.animal_id ?? '',
      start_time: consultation.start_time ?? '',
      end_time: consultation.end_time ?? '',
      reason: consultation.reason ?? '',
      examination: consultation.examination ?? '',
      diagnosis: consultation.diagnosis ?? '',
      treatment_plan: consultation.treatment_plan ?? '',
      notes: consultation.notes ?? '',
      status: consultation.status,
      color: consultation.color ?? '#f97316',
    } : undefined,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!consultation) {
    return <p className="text-muted-foreground">Consultation non trouvée</p>
  }

  const isReadOnly = consultation.status === 'completed' || consultation.status === 'cancelled'

  function handleSave(formData: ConsultationFormData) {
    const { animal_id, status, ...clinicalData } = formData
    updateConsultation.mutate(
      { id: consultationId!, data: clinicalData },
      { onSuccess: () => reset(formData) },
    )
  }

  function handleCloseConsultation() {
    updateConsultation.mutate(
      { id: consultationId!, data: { status: 'completed' } },
      {
        onSuccess: () => {
          setConfirmClose(false)
          toast.success('Consultation clôturée')
        },
      },
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/consultations')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{consultation.animals?.name}</h1>
            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${CONSULTATION_STATUS_COLORS[consultation.status] ?? ''}`}>
              {CONSULTATION_STATUS_LABELS[consultation.status as keyof typeof CONSULTATION_STATUS_LABELS]}
            </span>
          </div>
          <p className="text-muted-foreground">
            {consultation.clients
              ? `${consultation.clients.last_name} ${consultation.clients.first_name}`
              : consultation.animals?.clients
                ? `${consultation.animals.clients.last_name} ${consultation.animals.clients.first_name}`
                : ''}
            {' — '}
            {consultation.start_time
              ? `${formatDateTime(consultation.start_time)}${consultation.end_time ? ` - ${new Date(consultation.end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : ''}`
              : formatDateTime(consultation.date)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={createInvoice.isPending || (consultation.consultation_items ?? []).length === 0}
            onClick={() => {
              createInvoice.mutate(consultationId!, {
                onSuccess: (invoice) => {
                  navigate(`/factures/${invoice.id}`)
                },
              })
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            {createInvoice.isPending ? 'Création...' : 'Générer facture'}
          </Button>
          {!isReadOnly && (
            <Button variant="default" onClick={() => setConfirmClose(true)}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Clôturer
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Clinical notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes cliniques</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Motif de consultation</Label>
                <Textarea id="reason" {...register('reason')} rows={2} disabled={isReadOnly} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="examination">Examen clinique</Label>
                <Textarea id="examination" {...register('examination')} rows={3} disabled={isReadOnly} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnostic</Label>
                <Textarea id="diagnosis" {...register('diagnosis')} rows={2} disabled={isReadOnly} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment_plan">Plan de traitement</Label>
                <Textarea id="treatment_plan" {...register('treatment_plan')} rows={3} disabled={isReadOnly} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes supplémentaires</Label>
                <Textarea id="notes" {...register('notes')} rows={2} disabled={isReadOnly} />
              </div>

              {!isReadOnly && (
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={!isDirty || updateConsultation.isPending}>
                    {updateConsultation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Right: Items table */}
        <Card>
          <CardContent className="pt-6">
            <ConsultationItemsTable
              consultationId={consultationId!}
              items={consultation.consultation_items ?? []}
              readOnly={isReadOnly}
            />
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmClose}
        onOpenChange={setConfirmClose}
        title="Clôturer la consultation"
        description="Une fois clôturée, la consultation ne pourra plus être modifiée. Confirmez-vous ?"
        confirmLabel="Clôturer"
        onConfirm={handleCloseConsultation}
      />
    </div>
  )
}
