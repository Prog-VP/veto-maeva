import { useState } from 'react'
import { RefreshCw, Search, Package, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { useCatalogItems, useSyncCatalogFromBexio } from '../hooks/use-catalog'
import { formatCurrency } from '@/lib/utils'
import type { CatalogItem } from '@/services/catalog.service'

export default function CatalogPage() {
  const [tab, setTab] = useSearchParamsState('type', 'product')
  const [search, setSearch] = useState('')

  const activeType = (tab === 'service' ? 'service' : 'product') as 'product' | 'service'

  const { data, isLoading } = useCatalogItems(activeType, search)
  const syncBexio = useSyncCatalogFromBexio()

  const items = data?.data ?? []

  return (
    <div>
      <PageHeader
        title="Catalogue"
        description="Produits et services synchronisés depuis Bexio"
        action={
          <Button onClick={() => syncBexio.mutate()} disabled={syncBexio.isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncBexio.isPending ? 'animate-spin' : ''}`} />
            {syncBexio.isPending ? 'Synchronisation...' : 'Synchroniser depuis Bexio'}
          </Button>
        }
      />

      <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 mb-4 text-sm text-orange-800 flex items-center gap-2">
        <ExternalLink className="h-4 w-4 shrink-0" />
        <span>
          Les produits et services sont gérés dans Bexio. Utilisez le bouton "Synchroniser" pour importer les dernières modifications.
        </span>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="product">Produits</TabsTrigger>
          <TabsTrigger value="service">Services</TabsTrigger>
        </TabsList>

        <div className="relative mt-4 mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 max-w-sm"
          />
        </div>

        <TabsContent value="product">
          <CatalogTable items={items} isLoading={isLoading} showStock />
        </TabsContent>

        <TabsContent value="service">
          <CatalogTable items={items} isLoading={isLoading} showStock={false} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface CatalogTableProps {
  items: CatalogItem[]
  isLoading: boolean
  showStock: boolean
}

function CatalogTable({ items, isLoading, showStock }: CatalogTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Aucun article"
        description="Synchronisez le catalogue depuis Bexio pour voir les articles."
      />
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead className="text-right">Prix</TableHead>
            <TableHead>Unité</TableHead>
            {showStock && <TableHead className="text-right">Stock</TableHead>}
            <TableHead>Sync</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-muted-foreground">{item.category ?? '—'}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.default_price)}</TableCell>
              <TableCell className="text-muted-foreground">{item.unit ?? '—'}</TableCell>
              {showStock && (
                <TableCell className="text-right">
                  {item.track_stock ? (
                    <span
                      className={
                        item.stock_alert_threshold !== null && item.stock_quantity <= item.stock_alert_threshold
                          ? 'text-destructive font-medium'
                          : ''
                      }
                    >
                      {item.stock_quantity}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}
              <TableCell>
                {item.bexio_article_id ? (
                  <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
                    Bexio #{item.bexio_article_id}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Local
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
