import { ConfirmDialog } from './confirm-dialog'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'

interface UnsavedChangesGuardProps {
  isDirty: boolean
}

export function UnsavedChangesGuard({ isDirty }: UnsavedChangesGuardProps) {
  const { isBlocked, confirmNavigation, cancelNavigation } = useUnsavedChanges(isDirty)

  return (
    <ConfirmDialog
      open={isBlocked}
      onOpenChange={(open) => { if (!open) cancelNavigation() }}
      title="Modifications non enregistrées"
      description="Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter cette page ?"
      confirmLabel="Quitter"
      cancelLabel="Rester"
      variant="destructive"
      onConfirm={confirmNavigation}
    />
  )
}
