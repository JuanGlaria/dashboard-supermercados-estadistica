import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth'
import { TenantProvider, useTenant } from '@/lib/tenant'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { SelectorSucursalPage } from '@/pages/SelectorSucursalPage'

const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const AnuladosPage = lazy(() => import('@/pages/AnuladosPage').then((m) => ({ default: m.AnuladosPage })))

function RutaPrivada({ children }: { children: React.ReactNode }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return null
  if (!usuario) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RutaSucursalValida({ children }: { children: React.ReactNode }) {
  const { sucursal } = useParams()
  const tenant = useTenant()
  if (tenant.sucursales.length > 0 && !tenant.sucursales.some((s) => s.id === sucursal)) {
    return <NotFoundPage />
  }
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <TenantProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <RutaPrivada>
                  <SelectorSucursalPage />
                </RutaPrivada>
              }
            />
            <Route
              path="/dashboard/:sucursal"
              element={
                <RutaPrivada>
                  <RutaSucursalValida>
                    <Suspense fallback={<div className="p-8 text-muted-foreground">Cargando...</div>}>
                      <DashboardPage />
                    </Suspense>
                  </RutaSucursalValida>
                </RutaPrivada>
              }
            />
            <Route
              path="/anulados/:sucursal"
              element={
                <RutaPrivada>
                  <RutaSucursalValida>
                    <Suspense fallback={<div className="p-8 text-muted-foreground">Cargando...</div>}>
                      <AnuladosPage />
                    </Suspense>
                  </RutaSucursalValida>
                </RutaPrivada>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </TenantProvider>
    </BrowserRouter>
  )
}

export default App
