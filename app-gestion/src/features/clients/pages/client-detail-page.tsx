import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Pencil, Trash2, Stethoscope } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useClient, useUpdateClient, useDeleteClient } from '../hooks/use-clients'
import { useCreateAnimal, useDeleteAnimal } from '@/features/animals/hooks/use-animals'
import { ClientForm } from '../components/client-form'
import { AnimalForm } from '@/features/animals/components/animal-form'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SPECIES_LABELS, CONSULTATION_STATUS_LABELS, CONSULTATION_STATUS_COLORS } from '@/lib/constants'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { formatDateTime } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import type { ClientFormData } from '../schemas/client.schema'
import type { AnimalFormData } from '@/features/animals/schemas/animal.schema'

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useSearchParamsState('tab', 'infos')
  const [editMode, setEditMode] = useState(false)
  const [animalSheetOpen, setAnimalSheetOpen] = useState(false)
  const [deleteAnimalId, setDeleteAnimalId] = useState<string | null>(null)

  const { data: client, isLoading } = useClient(clientId!)
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()
  const createAnimal = useCreateAnimal()
  const deleteAnimal = useDeleteAnimal()

  // Fetch consultations for this client
  const { data: consultations } = useQuery({
    queryKey: ['consultations', 'client', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultations')
        .select('*, animals(id, name, species)')
        .eq('client_id', clientId!)
        .is('deleted_at', null)
        .order('start_time', { ascending: false, nullsFirst: false })
        .limit(20)
      if (error) throw error
      return data
    },
    enabled: !!clientId,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!client) {
    return <p className="text-muted-foreground">Client non trouvé</p>
  }

  function handleUpdate(data: ClientFormData) {
    updateClient.mutate(
      { id: clientId!, data },
      { onSuccess: () => setEditMode(false) },
    )
  }

  function handleDeleteClient() {
    deleteClient.mutate(
      { id: clientId!, bexioContactId: client?.bexio_contact_id ?? null },
      { onSuccess: () => navigate('/clients') },
    )
  }

  function handleCreateAnimal(data: AnimalFormData) {
    createAnimal.mutate(data, {
      onSuccess: () => setAnimalSheetOpen(false),
    })
  }

  function handleDeleteAnimal() {
    if (deleteAnimalId) {
      deleteAnimal.mutate(
        { id: deleteAnimalId, clientId: clientId! },
        { onSuccess: () => setDeleteAnimalId(null) },
      )
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{client.last_name} {client.first_name}</h1>
          {client.email && <p className="text-muted-foreground">{client.email}</p>}
        </div>
        <Button variant="outline" size="icon" onClick={() => { setEditMode(true); setTab('infos') }}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="text-destructive" onClick={handleDeleteClient}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="infos">Informations</TabsTrigger>
          <TabsTrigger value="animaux">
            Animaux
            {client.animals.length > 0 && (
              <Badge variant="secondary" className="ml-2">{client.animals.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="consultations">
            <Stethoscope className="h-3.5 w-3.5 mr-1.5" />
            Consultations
            {(consultations?.length ?? 0) > 0 && (
              <Badge variant="secondary" className="ml-2">{consultations!.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Infos */}
        <TabsContent value="infos" className="mt-4">
          {editMode ? (
            <Card>
              <CardHeader>
                <CardTitle>Modifier le client</CardTitle>
              </CardHeader>
              <CardContent>
                <ClientForm
                  client={client}
                  onSubmit={handleUpdate}
                  isPending={updateClient.isPending}
                />
                <Button variant="ghost" className="mt-2" onClick={() => setEditMode(false)}>
                  Annuler
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-muted-foreground">Nom complet</dt>
                    <dd className="font-medium">{client.first_name} {client.last_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Email</dt>
                    <dd>{client.email ?? '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Téléphone</dt>
                    <dd>{client.phone ?? '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Adresse</dt>
                    <dd>{client.address ?? '-'}</dd>
                  </div>
                  {client.notes && (
                    <div className="col-span-2">
                      <dt className="text-sm text-muted-foreground">Notes</dt>
                      <dd className="whitespace-pre-wrap">{client.notes}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Animaux */}
        <TabsContent value="animaux" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setAnimalSheetOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un animal
            </Button>
          </div>

          {client.animals.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucun animal enregistré pour ce client
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {client.animals.map((animal) => (
                <Card key={animal.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <Link
                        to={`/clients/${clientId}/animaux/${animal.id}`}
                        className="flex-1"
                      >
                        <h3 className="font-semibold text-lg">{animal.name}</h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">
                            {SPECIES_LABELS[animal.species as keyof typeof SPECIES_LABELS] ?? animal.species}
                          </Badge>
                          {animal.breed && (
                            <span className="text-sm text-muted-foreground">{animal.breed}</span>
                          )}
                        </div>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteAnimalId(animal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Consultations */}
        <TabsContent value="consultations" className="mt-4">
          {!consultations?.length ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucune consultation pour ce client
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Animal</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultations.map((consult: Record<string, unknown>) => (
                    <TableRow
                      key={consult.id as string}
                      className="cursor-pointer"
                      onClick={() => navigate(`/consultations/${consult.id}`)}
                    >
                      <TableCell className="font-medium">
                        {formatDateTime((consult.start_time ?? consult.date) as string)}
                      </TableCell>
                      <TableCell>
                        {(consult.animals as Record<string, unknown> | null)?.name as string ?? '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {(consult.reason as string) ?? '-'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={CONSULTATION_STATUS_LABELS[consult.status as keyof typeof CONSULTATION_STATUS_LABELS] ?? (consult.status as string)}
                          colorClass={CONSULTATION_STATUS_COLORS[consult.status as string] ?? ''}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Sheet open={animalSheetOpen} onOpenChange={setAnimalSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto p-0">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle>Ajouter un animal</SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6">
            <AnimalForm
              clientId={clientId!}
              onSubmit={handleCreateAnimal}
              isPending={createAnimal.isPending}
            />
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteAnimalId}
        onOpenChange={(open) => { if (!open) setDeleteAnimalId(null) }}
        title="Supprimer l'animal"
        description="Cette action supprimera l'animal et tout son historique médical."
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={handleDeleteAnimal}
      />
    </div>
  )
}
