import { useQuery } from '@tanstack/react-query'
import {
  Calendar,
  Users,
  Stethoscope,
  FileText,
  AlertTriangle,
  Package,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { formatDate, formatDateTime } from '@/lib/utils'
import { SPECIES_LABELS } from '@/lib/constants'

function todayRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
  return { start, end }
}

export default function DashboardPage() {
  const today = new Date()
  const { start: todayStart, end: todayEnd } = todayRange()

  // --- Stats queries ---
  const { data: appointmentsToday, isLoading: loadingAppts } = useQuery({
    queryKey: ['dashboard', 'stats', 'appointments-today'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .gte('start_time', todayStart)
        .lt('start_time', todayEnd)
      if (error) throw error
      return count ?? 0
    },
  })

  const { data: activeClients, isLoading: loadingClients } = useQuery({
    queryKey: ['dashboard', 'stats', 'active-clients'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
      if (error) throw error
      return count ?? 0
    },
  })

  const { data: openConsultations, isLoading: loadingConsultations } = useQuery({
    queryKey: ['dashboard', 'stats', 'open-consultations'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')
        .is('deleted_at', null)
      if (error) throw error
      return count ?? 0
    },
  })

  const { data: unpaidInvoices, isLoading: loadingInvoices } = useQuery({
    queryKey: ['dashboard', 'stats', 'unpaid-invoices'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'paid')
        .is('deleted_at', null)
      if (error) throw error
      return count ?? 0
    },
  })

  // --- Upcoming appointments ---
  const { data: upcomingAppointments, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['dashboard', 'appointments'],
    queryFn: async () => {
      const now = new Date().toISOString()
      const weekLater = new Date(Date.now() + 7 * 86400000).toISOString()
      const { data, error } = await supabase
        .from('appointments')
        .select('*, clients(first_name, last_name), animals(name, species)')
        .is('deleted_at', null)
        .gte('start_time', now)
        .lte('start_time', weekLater)
        .order('start_time', { ascending: true })
        .limit(8)
      if (error) throw error
      return data
    },
  })

  // --- Low stock ---
  const { data: lowStock, isLoading: loadingStock } = useQuery({
    queryKey: ['dashboard', 'stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog_items')
        .select('*')
        .eq('track_stock', true)
        .is('deleted_at', null)
        .order('stock_quantity', { ascending: true })
        .limit(10)
      if (error) throw error
      return (data ?? []).filter(
        (item: any) =>
          item.stock_alert_threshold !== null &&
          item.stock_quantity <= item.stock_alert_threshold
      )
    },
  })

  const stats = [
    {
      label: 'RDV aujourd\'hui',
      value: appointmentsToday,
      loading: loadingAppts,
      icon: Calendar,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      label: 'Clients actifs',
      value: activeClients,
      loading: loadingClients,
      icon: Users,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Consultations ouvertes',
      value: openConsultations,
      loading: loadingConsultations,
      icon: Stethoscope,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      label: 'Factures impayées',
      value: unpaidInvoices,
      loading: loadingInvoices,
      icon: FileText,
      color: 'bg-amber-100 text-amber-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold">
          Bonjour 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {formatDate(today)} — Tableau de bord
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${stat.color}`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                {stat.loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-3xl font-bold">{stat.value}</p>
                )}
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: upcoming appointments */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              Prochains rendez-vous
            </CardTitle>
            <Link to="/planning" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Voir tout <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {loadingUpcoming ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : !upcomingAppointments?.length ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                Aucun rendez-vous a venir
              </p>
            ) : (
              <ul className="space-y-3">
                {upcomingAppointments.map((appt: any) => (
                  <li key={appt.id}>
                    <Link
                      to="/planning"
                      className="flex items-start justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {appt.clients
                            ? `${appt.clients.first_name} ${appt.clients.last_name}`
                            : 'Client inconnu'}
                        </p>
                        {appt.animals && (
                          <p className="text-muted-foreground text-xs">
                            {appt.animals.name}
                            {appt.animals.species && (
                              <span>
                                {' '}
                                ({SPECIES_LABELS[appt.animals.species as keyof typeof SPECIES_LABELS] ?? appt.animals.species})
                              </span>
                            )}
                          </p>
                        )}
                        {appt.reason && (
                          <p className="text-muted-foreground text-xs truncate max-w-[240px]">
                            {appt.reason}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {formatDateTime(appt.start_time)}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Right: stock alerts */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Alertes stock
            </CardTitle>
            <Link to="/stock" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Voir tout <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {loadingStock ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : !lowStock?.length ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
                <p className="text-sm font-medium text-emerald-600">
                  Tout est en ordre
                </p>
                <p className="text-muted-foreground text-xs">
                  Aucun produit en dessous du seuil d'alerte
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {lowStock.map((item: any) => (
                  <li key={item.id}>
                    <Link
                      to="/stock"
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-muted-foreground text-xs">
                            Seuil: {item.stock_alert_threshold}
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive" className="shrink-0">
                        {item.stock_quantity}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
