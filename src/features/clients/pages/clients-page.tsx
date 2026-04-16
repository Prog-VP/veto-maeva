import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Users, MoreHorizontal, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { useClients, useCreateClient, useDeleteClient, useSyncClientsFromBexio } from '../hooks/use-clients'
import { ClientForm } from '../components/client-form'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import type { ClientFormData } from '../schemas/client.schema'

export default function ClientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; bexioContactId: number | null } | null>(null)

  const { data, isLoading } = useClients(search)
  const createClient = useCreateClient()
  const deleteClient = useDeleteClient()
  const syncBexio = useSyncClientsFromBexio()

  const clients = data?.data ?? []

  function handleCreate(formData: ClientFormData) {
    createClient.mutate(formData, {
      onSuccess: () => setSheetOpen(false),
    })
  }

  function handleDelete() {
    if (deleteTarget) {
      deleteClient.mutate(deleteTarget, {
        onSuccess: () => setDeleteTarget(null),
      })
    }
  }

  return (
    <div>
      <PageHeader
        title="Clients"
        description={`${data?.count ?? 0} client${(data?.count ?? 0) > 1 ? 's' : ''}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => syncBexio.mutate()} disabled={syncBexio.isPending}>
              <RefreshCw className={`h-4 w-4 mr-2 ${syncBexio.isPending ? 'animate-spin' : ''}`} />
              {syncBexio.isPending ? 'Sync...' : 'Importer Bexio'}
            </Button>
            <Button onClick={() => setSheetOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau client
            </Button>
          </div>
        }
      />

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun client"
          description={search ? 'Aucun résultat pour cette recherche' : 'Commencez par ajouter votre premier client'}
          action={
            !search && (
              <Button onClick={() => setSheetOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau client
              </Button>
            )
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <TableCell className="font-medium">
                    {client.last_name} {client.first_name}
                  </TableCell>
                  <TableCell>{client.email ?? '-'}</TableCell>
                  <TableCell>{client.phone ?? '-'}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{client.address ?? '-'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent"
                        onClick={(e) => e.stopPropagation()}
                        render={<button />}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/clients/${client.id}`) }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: client.id, bexioContactId: client.bexio_contact_id }) }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto p-0">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle>Nouveau client</SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6">
            <ClientForm onSubmit={handleCreate} isPending={createClient.isPending} />
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Supprimer le client"
        description="Cette action est irréversible. Le client et ses données seront supprimés."
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
