import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Stethoscope, MoreHorizontal, Trash2 } from 'lucide-react'
import { useConsultations, useDeleteConsultation } from '../hooks/use-consultations'
import { ConsultationSheet } from '../components/consultation-sheet'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { CONSULTATION_STATUS_LABELS, CONSULTATION_STATUS_COLORS } from '@/lib/constants'
import { formatDateTime } from '@/lib/utils'

export default function ConsultationsPage() {
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { data: allConsultations = [], isLoading } = useConsultations()
  const deleteConsultation = useDeleteConsultation()

  const consultations = useMemo(() => {
    if (!search) return allConsultations
    const q = search.toLowerCase()
    return allConsultations.filter((c) => {
      const clientName = `${c.clients?.first_name ?? ''} ${c.clients?.last_name ?? ''} ${c.animals?.clients?.first_name ?? ''} ${c.animals?.clients?.last_name ?? ''}`.toLowerCase()
      const animalName = c.animals?.name?.toLowerCase() ?? ''
      const reason = c.reason?.toLowerCase() ?? ''
      return clientName.includes(q) || animalName.includes(q) || reason.includes(q)
    })
  }, [allConsultations, search])

  function handleDelete() {
    if (deleteId) {
      deleteConsultation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      })
    }
  }

  return (
    <div>
      <PageHeader
        title="Consultations"
        description={`${allConsultations.length} consultation${allConsultations.length > 1 ? 's' : ''}`}
        action={
          <Button onClick={() => setSheetOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle consultation
          </Button>
        }
      />

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
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
      ) : consultations.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="Aucune consultation"
          description={search ? 'Aucun résultat pour cette recherche' : 'Commencez par créer votre première consultation'}
          action={
            !search && (
              <Button onClick={() => setSheetOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle consultation
              </Button>
            )
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Heure</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Animal</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {consultations.map((consultation) => (
                <TableRow
                  key={consultation.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/consultations/${consultation.id}`)}
                >
                  <TableCell>
                    {formatDateTime(consultation.start_time ?? consultation.date)}
                  </TableCell>
                  <TableCell>
                    {consultation.clients?.last_name ?? consultation.animals?.clients?.last_name ?? '-'}
                  </TableCell>
                  <TableCell className="font-medium">{consultation.animals?.name ?? '-'}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{consultation.reason ?? '-'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${CONSULTATION_STATUS_COLORS[consultation.status] ?? ''}`}>
                      {CONSULTATION_STATUS_LABELS[consultation.status as keyof typeof CONSULTATION_STATUS_LABELS] ?? consultation.status}
                    </span>
                  </TableCell>
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
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => { e.stopPropagation(); setDeleteId(consultation.id) }}
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

      <ConsultationSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Supprimer la consultation"
        description="Cette action est irréversible. La consultation et ses articles seront supprimés."
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
