import { Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import { Sidebar } from './sidebar'

export function RootLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Suspense fallback={<div className="animate-pulse h-8 w-48 bg-muted rounded" />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
