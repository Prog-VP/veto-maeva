import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, Search } from 'lucide-react'
import { useAddConsultationItem, useRemoveConsultationItem } from '../hooks/use-consultations'
import { consultationItemSchema, type ConsultationItemFormData } from '../schemas/consultation.schema'
import { useCatalogItems } from '@/features/catalog/hooks/use-catalog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import type { ConsultationItemWithCatalog } from '@/services/consultations.service'
import type { CatalogItem } from '@/services/catalog.service'

interface ConsultationItemsTableProps {
  consultationId: string
  items: ConsultationItemWithCatalog[]
  readOnly?: boolean
}

export function ConsultationItemsTable({ consultationId, items, readOnly }: ConsultationItemsTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const addItem = useAddConsultationItem()
  const removeItem = useRemoveConsultationItem()

  const total = useMemo(() =>
    items.reduce((sum, item) => sum + item.quantity * item.unit_price * (1 - item.discount / 100), 0),
    [items]
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Produits & Services</h3>
        {!readOnly && (
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Aucun article ajouté
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit/Service</TableHead>
                <TableHead className="text-right w-20">Qté</TableHead>
                <TableHead className="text-right w-28">Prix unit.</TableHead>
                <TableHead className="text-right w-20">Remise</TableHead>
                <TableHead className="text-right w-28">Total</TableHead>
                {!readOnly && <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const lineTotal = item.quantity * item.unit_price * (1 - item.discount / 100)
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.catalog_items?.name ?? 'Article supprimé'}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell className="text-right">{item.discount > 0 ? `${item.discount}%` : '-'}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(lineTotal)}</TableCell>
                    {!readOnly && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem.mutate({ itemId: item.id, consultationId })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
              <TableRow>
                <TableCell colSpan={readOnly ? 4 : 4} className="text-right font-semibold">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(total)}</TableCell>
                {!readOnly && <TableCell />}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      <AddItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={(data) => {
          addItem.mutate(
            { consultationId, data },
            { onSuccess: () => setDialogOpen(false) },
          )
        }}
        isPending={addItem.isPending}
      />
    </div>
  )
}

function AddItemDialog({
  open,
  onOpenChange,
  onAdd,
  isPending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: ConsultationItemFormData) => void
  isPending: boolean
}) {
  const [catalogSearch, setCatalogSearch] = useState('')
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogItem | null>(null)

  const { data: products } = useCatalogItems('product', catalogSearch)
  const { data: services } = useCatalogItems('service', catalogSearch)

  const allCatalogItems = useMemo(() => {
    const p = products?.data ?? []
    const s = services?.data ?? []
    return [...p, ...s]
  }, [products, services])

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ConsultationItemFormData>({
    resolver: zodResolver(consultationItemSchema) as any,
    defaultValues: {
      catalog_item_id: null,
      quantity: 1,
      unit_price: 0,
      discount: 0,
      notes: null,
    },
  })

  function handleSelectCatalogItem(item: CatalogItem) {
    setSelectedCatalog(item)
    setValue('catalog_item_id', item.id)
    setValue('unit_price', item.default_price)
    setCatalogSearch('')
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      reset()
      setSelectedCatalog(null)
      setCatalogSearch('')
    }
    onOpenChange(nextOpen)
  }

  function onSubmit(data: ConsultationItemFormData) {
    onAdd(data)
    reset()
    setSelectedCatalog(null)
    setCatalogSearch('')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un article</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Article du catalogue *</Label>
            {selectedCatalog ? (
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-sm font-medium">{selectedCatalog.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCatalog(null)
                    setValue('catalog_item_id', null)
                  }}
                >
                  Changer
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un article..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {allCatalogItems.length > 0 && (
                  <div className="max-h-40 overflow-y-auto rounded-md border">
                    {allCatalogItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent text-left"
                        onClick={() => handleSelectCatalogItem(item)}
                      >
                        <span>{item.name}</span>
                        <span className="text-muted-foreground">{formatCurrency(item.default_price)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {errors.catalog_item_id && (
              <p className="text-sm text-destructive">{errors.catalog_item_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité *</Label>
              <Input id="quantity" type="number" step="0.01" {...register('quantity')} />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_price">Prix unitaire *</Label>
              <Input id="unit_price" type="number" step="0.01" {...register('unit_price')} />
              {errors.unit_price && (
                <p className="text-sm text-destructive">{errors.unit_price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Remise (%)</Label>
              <Input id="discount" type="number" step="1" {...register('discount')} />
              {errors.discount && (
                <p className="text-sm text-destructive">{errors.discount.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-notes">Notes</Label>
            <Input id="item-notes" {...register('notes')} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Ajout...' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
