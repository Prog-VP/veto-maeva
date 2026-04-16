import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { animalSchema, type AnimalFormData } from '../schemas/animal.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SPECIES_LABELS, SEX_LABELS } from '@/lib/constants'
import type { Animal } from '@/services/animals.service'
import { AnimalPhotoUpload } from './animal-photo-upload'

interface AnimalFormProps {
  animal?: Animal
  clientId: string
  onSubmit: (data: AnimalFormData) => void
  onPhotoUpload?: (file: File) => void
  onPhotoRemove?: () => void
  isUploadingPhoto?: boolean
  isPending?: boolean
}

export function AnimalForm({ animal, clientId, onSubmit, onPhotoUpload, onPhotoRemove, isUploadingPhoto, isPending }: AnimalFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<AnimalFormData>({
    resolver: zodResolver(animalSchema) as any,
    defaultValues: {
      name: animal?.name ?? '',
      species: animal?.species ?? 'chien',
      breed: animal?.breed ?? '',
      sex: animal?.sex ?? 'unknown',
      birth_date: animal?.birth_date ?? '',
      weight: animal?.weight ?? null,
      chip_number: animal?.chip_number ?? '',
      notes: animal?.notes ?? '',
      client_id: clientId,
    },
  })

  const species = watch('species')
  const sex = watch('sex')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {animal && onPhotoUpload && (
        <div className="flex justify-center">
          <AnimalPhotoUpload
            photoUrl={animal.photo_url}
            animalName={animal.name}
            species={animal.species}
            onUpload={onPhotoUpload}
            onRemove={onPhotoRemove}
            isUploading={isUploadingPhoto}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nom de l'animal *</Label>
        <Input id="name" {...register('name')} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Espèce *</Label>
          <Select value={species} onValueChange={(v) => setValue('species', v as AnimalFormData['species'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SPECIES_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Sexe</Label>
          <Select value={sex} onValueChange={(v) => setValue('sex', v as AnimalFormData['sex'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SEX_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="breed">Race</Label>
          <Input id="breed" {...register('breed')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="birth_date">Date de naissance</Label>
          <Input id="birth_date" type="date" {...register('birth_date')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weight">Poids (kg)</Label>
          <Input id="weight" type="number" step="0.01" {...register('weight')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="chip_number">N° puce / tatouage</Label>
          <Input id="chip_number" {...register('chip_number')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register('notes')} rows={3} />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Enregistrement...' : animal ? 'Mettre à jour' : 'Ajouter l\'animal'}
        </Button>
      </div>
    </form>
  )
}
