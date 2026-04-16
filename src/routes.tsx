import { createBrowserRouter } from 'react-router-dom'
import { lazy } from 'react'
import { RootLayout } from '@/app/layout'

// Lazy load all pages
const DashboardPage = lazy(() => import('@/features/dashboard/pages/dashboard-page'))
const PlanningPage = lazy(() => import('@/features/appointments/pages/planning-page'))
const ClientsPage = lazy(() => import('@/features/clients/pages/clients-page'))
const ClientDetailPage = lazy(() => import('@/features/clients/pages/client-detail-page'))
const AnimalDetailPage = lazy(() => import('@/features/animals/pages/animal-detail-page'))
const CatalogPage = lazy(() => import('@/features/catalog/pages/catalog-page'))
const InvoicesPage = lazy(() => import('@/features/invoices/pages/invoices-page'))
const InvoiceDetailPage = lazy(() => import('@/features/invoices/pages/invoice-detail-page'))
const ConsultationsPage = lazy(() => import('@/features/consultations/pages/consultations-page'))
const ConsultationDetailPage = lazy(() => import('@/features/consultations/pages/consultation-detail-page'))
const StockPage = lazy(() => import('@/features/stock/pages/stock-page'))

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'planning', element: <PlanningPage /> },
      { path: 'clients', element: <ClientsPage /> },
      { path: 'clients/:clientId', element: <ClientDetailPage /> },
      { path: 'clients/:clientId/animaux/:animalId', element: <AnimalDetailPage /> },
      { path: 'catalogue', element: <CatalogPage /> },
      { path: 'factures', element: <InvoicesPage /> },
      { path: 'factures/:invoiceId', element: <InvoiceDetailPage /> },
      { path: 'consultations', element: <ConsultationsPage /> },
      { path: 'consultations/:consultationId', element: <ConsultationDetailPage /> },
      { path: 'stock', element: <StockPage /> },
    ],
  },
])
