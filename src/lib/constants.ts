export const SPECIES_LABELS = {
  cheval: 'Cheval',
  chien: 'Chien',
  chat: 'Chat',
} as const

export const SEX_LABELS = {
  male: 'Mâle',
  female: 'Femelle',
  unknown: 'Inconnu',
} as const

export const APPOINTMENT_STATUS_LABELS = {
  scheduled: 'Planifié',
  confirmed: 'Confirmé',
  in_progress: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
  no_show: 'Absent',
} as const

export const CONSULTATION_STATUS_LABELS = {
  scheduled: 'Planifiée',
  completed: 'Terminée',
  cancelled: 'Annulée',
} as const

export const CONSULTATION_STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-orange-100 text-orange-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-stone-100 text-stone-600',
}

export const INVOICE_STATUS_LABELS = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  cancelled: 'Annulée',
} as const

export const APPOINTMENT_STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-orange-100 text-orange-800',
  confirmed: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-stone-100 text-stone-600',
  no_show: 'bg-red-100 text-red-800',
}

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-stone-100 text-stone-600',
  sent: 'bg-orange-100 text-orange-800',
  paid: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
}
