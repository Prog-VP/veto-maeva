import { useRef, useState } from 'react'
import { Camera, Trash2, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface AnimalPhotoUploadProps {
  photoUrl: string | null
  animalName: string
  species: string
  onUpload: (file: File) => void
  onRemove?: () => void
  isUploading?: boolean
  size?: 'sm' | 'lg'
}

const SPECIES_EMOJI: Record<string, string> = {
  Chien: '🐕',
  Chat: '🐱',
  Cheval: '🐴',
  dog: '🐕',
  cat: '🐱',
  horse: '🐴',
}

export function AnimalPhotoUpload({
  photoUrl,
  animalName,
  species,
  onUpload,
  onRemove,
  isUploading,
  size = 'lg',
}: AnimalPhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const sizeClasses = size === 'lg' ? 'h-24 w-24' : 'h-12 w-12'
  const fallbackEmoji = SPECIES_EMOJI[species] ?? '🐾'

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    onUpload(file)

    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const displayUrl = preview ?? photoUrl

  return (
    <div className="flex items-center gap-4">
      <div className="relative group cursor-pointer" onClick={() => inputRef.current?.click()}>
        <Avatar className={sizeClasses}>
          <AvatarImage src={displayUrl ?? undefined} alt={animalName} className="object-cover" />
          <AvatarFallback className="text-2xl">{fallbackEmoji}</AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {isUploading ? (
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          ) : (
            <Camera className="h-5 w-5 text-white" />
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {displayUrl && onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          disabled={isUploading}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
