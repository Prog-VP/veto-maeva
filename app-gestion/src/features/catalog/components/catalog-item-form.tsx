import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { catalogItemSchema, type CatalogItemFormData, type CatalogItemFormInput } from '../schemas/catalog.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CatalogItem } from '@/services/catalog.service'

interface CatalogItemFormProps {
  type: 'product' | 'service'
  item?: CatalogItem
  onSubmit: (data: CatalogItemFormData) => void
  isPending?: boolean
}

export function CatalogItemForm({ type, item, onSubmit, isPending }: CatalogItemFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CatalogItemFormInput, unknown, CatalogItemFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(catalogItemSchema) as any,
    defaultValues: {
      type,
      name: item?.name ?? '',
      category: item?.category ?? '',
      default_price: item?.default_price ?? 0,
      tax_rate: item?.tax_rate ?? 0.077,
      unit: item?.unit ?? '',
      track_stock: item?.track_stock ?? false,
      stock_quantity: item?.stock_quantity ?? 0,
      stock_alert_threshold: item?.stock_alert_threshold ?? null,
    },
  })

  const trackStock = watch('track_stock')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register('type')} />

      <div className="space-y-2">
        <Label htmlFor="name">Nom *</Label>
        <Input id="name" {...register('name')} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Catégorie</Label>
        <Input
          id="category"
          placeholder={type === 'product' ? 'ex: Médicament, Aliment' : 'ex: Vaccination, Chirurgie'}
          {...register('category')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="default_price">Prix (CHF) *</Label>
          <Input id="default_price" type="number" step="0.01" min="0" {...register('default_price')} />
          {errors.default_price && (
            <p className="text-sm text-destructive">{errors.default_price.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax_rate">TVA (ex: 0.077 = 7.7%)</Label>
          <Input id="tax_rate" type="number" step="0.001" min="0" max="1" {...register('tax_rate')} />
          {errors.tax_rate && (
            <p className="text-sm text-destructive">{errors.tax_rate.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Unité</Label>
        <Input
          id="unit"
          placeholder="ex: pièce, ml, dose"
          {...register('unit')}
        />
      </div>

      {type === 'product' && (
        <>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="track_stock"
              className="h-4 w-4 rounded border-input"
              checked={trackStock}
              onChange={(e) => setValue('track_stock', e.target.checked)}
            />
            <Label htmlFor="track_stock" className="cursor-pointer">
              Suivre le stock
            </Label>
          </div>

          {trackStock && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Quantité en stock</Label>
                <Input id="stock_quantity" type="number" min="0" {...register('stock_quantity')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_alert_threshold">Seuil d'alerte</Label>
                <Input id="stock_alert_threshold" type="number" min="0" {...register('stock_alert_threshold')} />
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Enregistrement...' : item ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}
