import { useState } from 'react'
import { Package, Plus, Minus, AlertTriangle, Search } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function StockPage() {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data: items, isLoading } = useQuery({
    queryKey: ['stock', search],
    queryFn: async () => {
      let query = supabase
        .from('catalog_items')
        .select('*')
        .eq('track_stock', true)
        .is('deleted_at', null)
      if (search) {
        query = query.ilike('name', `%${search}%`)
      }
      const { data, error } = await query.order('name')
      if (error) throw error
      return data
    },
  })

  const adjustStock = useMutation({
    mutationFn: async ({ id, delta }: { id: string; delta: number }) => {
      const { data: current } = await supabase
        .from('catalog_items')
        .select('stock_quantity')
        .eq('id', id)
        .single()
      const newQty = Math.max(0, (current?.stock_quantity ?? 0) + delta)
      const { error } = await supabase
        .from('catalog_items')
        .update({ stock_quantity: newQty })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] })
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du stock')
    },
  })

  const lowStockItems = items?.filter(
    (item) =>
      item.stock_alert_threshold !== null &&
      item.stock_quantity <= item.stock_alert_threshold
  ) ?? []

  return (
    <div>
      <PageHeader
        title="Stock"
        description={
          items
            ? `${items.length} article${items.length > 1 ? 's' : ''} suivi${items.length > 1 ? 's' : ''}`
            : 'Chargement...'
        }
      />

      {lowStockItems.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 mb-4 dark:border-orange-900 dark:bg-orange-950/50">
          <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0" />
          <p className="text-sm text-orange-800 dark:text-orange-300">
            <span className="font-medium">
              {lowStockItems.length} article{lowStockItems.length > 1 ? 's' : ''}
            </span>{' '}
            en dessous du seuil d'alerte :{' '}
            {lowStockItems.map((item) => item.name).join(', ')}
          </p>
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un article..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !items || items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucun article en stock"
          description="Aucun article avec suivi de stock trouvé."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead className="text-right">Seuil d'alerte</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const isLow =
                  item.stock_alert_threshold !== null &&
                  item.stock_quantity <= item.stock_alert_threshold
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.category ?? '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={isLow ? 'text-destructive font-medium' : ''}>
                        {item.stock_quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {item.stock_alert_threshold ?? '—'}
                    </TableCell>
                    <TableCell>
                      {isLow ? (
                        <Badge variant="destructive">Stock bas</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          OK
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={adjustStock.isPending || item.stock_quantity <= 0}
                          onClick={() =>
                            adjustStock.mutate({ id: item.id, delta: -1 })
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={adjustStock.isPending}
                          onClick={() =>
                            adjustStock.mutate({ id: item.id, delta: 1 })
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
