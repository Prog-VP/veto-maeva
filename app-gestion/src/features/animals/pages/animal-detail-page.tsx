import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAnimal, useUpdateAnimal, useUploadAnimalPhoto, useDeleteAnimalPhoto } from '../hooks/use-animals'
import { AnimalForm } from '../components/animal-form'
import { AnimalPhotoUpload } from '../components/animal-photo-upload'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SPECIES_LABELS, SEX_LABELS, CONSULTATION_STATUS_LABELS } from '@/lib/constants'
import { formatDate, formatDateTime } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import type { AnimalFormData } from '../schemas/animal.schema'

const CONSULTATION_STATUS_COLORS: Record<string, string> = {
  open: 'bg-orange-100 text-orange-800',
  completed: 'bg-emerald-100 text-emerald-800',
}

export default function AnimalDetailPage() {
  const { clientId, animalId } = useParams<{ clientId: string; animalId: string }>()
  const navigate = useNavigate()
  const [editMode, setEditMode] = useState(false)

  const { data: animal, isLoading } = useAnimal(animalId!)
  const updateAnimal = useUpdateAnimal()
  const uploadPhoto = useUploadAnimalPhoto()
  const deletePhoto = useDeleteAnimalPhoto()

  // Fetch consultations for this animal
  const { data: consultations } = useQuery({
    queryKey: ['consultations', 'animal', animalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('animal_id', animalId!)
        .is('deleted_at', null)
        .order('date', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!animalId,
  })

  // Fetch appointments for this animal
  const { data: appointments } = useQuery({
    queryKey: ['appointments', 'animal', animalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('animal_id', animalId!)
        .is('deleted_at', null)
        .order('start_time', { ascending: false })
        .limit(10)
      if (error) throw error
      return data
    },
    enabled: !!animalId,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!animal) {
    return <p className="text-muted-foreground">Animal non trouvé</p>
  }

  function handleUpdate(data: AnimalFormData) {
    updateAnimal.mutate(
      { id: animalId!, data },
      { onSuccess: () => setEditMode(false) },
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/clients/${clientId}?tab=animaux`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <AnimalPhotoUpload
          photoUrl={animal.photo_url}
          animalName={animal.name}
          species={animal.species}
          onUpload={(file) => uploadPhoto.mutate({ animalId: animalId!, file })}
          onRemove={animal.photo_url ? () => deletePhoto.mutate({ animalId: animalId!, photoUrl: animal.photo_url! }) : undefined}
          isUploading={uploadPhoto.isPending}
          size="sm"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{animal.name}</h1>
          <p className="text-muted-foreground">
            {animal.clients.first_name} {animal.clients.last_name}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => setEditMode(!editMode)}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>

      {editMode ? (
        <Card>
          <CardHeader>
            <CardTitle>Modifier l'animal</CardTitle>
          </CardHeader>
          <CardContent>
            <AnimalForm
              animal={animal}
              clientId={clientId!}
              onSubmit={handleUpdate}
              onPhotoUpload={(file) => uploadPhoto.mutate({ animalId: animalId!, file })}
              onPhotoRemove={animal.photo_url ? () => deletePhoto.mutate({ animalId: animalId!, photoUrl: animal.photo_url! }) : undefined}
              isUploadingPhoto={uploadPhoto.isPending}
              isPending={updateAnimal.isPending}
            />
            <Button variant="ghost" className="mt-2" onClick={() => setEditMode(false)}>
              Annuler
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {/* Infos */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Espèce</dt>
                  <dd>
                    <Badge variant="outline">
                      {SPECIES_LABELS[animal.species]}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Race</dt>
                  <dd>{animal.breed ?? '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Sexe</dt>
                  <dd>{SEX_LABELS[animal.sex]}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Date de naissance</dt>
                  <dd>{animal.birth_date ? formatDate(animal.birth_date) : '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Poids</dt>
                  <dd>{animal.weight ? `${animal.weight} kg` : '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">N° puce</dt>
                  <dd className="font-mono text-sm">{animal.chip_number ?? '-'}</dd>
                </div>
                {animal.notes && (
                  <div className="col-span-full">
                    <dt className="text-sm text-muted-foreground">Notes</dt>
                    <dd className="whitespace-pre-wrap">{animal.notes}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Prochains RDV */}
          <Card>
            <CardHeader>
              <CardTitle>Rendez-vous</CardTitle>
            </CardHeader>
            <CardContent>
              {!appointments?.length ? (
                <p className="text-muted-foreground text-sm">Aucun rendez-vous</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Motif</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((apt) => (
                        <TableRow key={apt.id} className="cursor-pointer" onClick={() => navigate('/planning')}>
                          <TableCell className="font-medium">{formatDateTime(apt.start_time)}</TableCell>
                          <TableCell className="text-muted-foreground">{apt.reason ?? '-'}</TableCell>
                          <TableCell>
                            <StatusBadge
                              label={apt.status}
                              colorClass={`bg-orange-100 text-orange-800`}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historique médical */}
          <Card>
            <CardHeader>
              <CardTitle>Historique médical</CardTitle>
            </CardHeader>
            <CardContent>
              {!consultations?.length ? (
                <p className="text-muted-foreground text-sm">Aucune consultation enregistrée</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Motif</TableHead>
                        <TableHead>Diagnostic</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consultations.map((consult) => (
                        <TableRow
                          key={consult.id}
                          className="cursor-pointer"
                          onClick={() => navigate(`/consultations/${consult.id}`)}
                        >
                          <TableCell className="font-medium">{formatDateTime(consult.date)}</TableCell>
                          <TableCell className="text-muted-foreground">{consult.reason ?? '-'}</TableCell>
                          <TableCell className="text-muted-foreground max-w-[200px] truncate">
                            {consult.diagnosis ?? '-'}
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              label={CONSULTATION_STATUS_LABELS[consult.status as keyof typeof CONSULTATION_STATUS_LABELS] ?? consult.status}
                              colorClass={CONSULTATION_STATUS_COLORS[consult.status] ?? ''}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
