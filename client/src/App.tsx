import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth'
import { TenantProvider } from '@/lib/tenant'
import { LoginPage } from '@/pages/LoginPage'
import { SelectorSucursalPage } from '@/pages/SelectorSucursalPage'

const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const AnuladosPage = lazy(() => import('@/pages/AnuladosPage').then((m) => ({ default: m.AnuladosPage })))

function RutaPrivada({ children }: { children: React.ReactNode }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return null
  if (!usuario) return <Navigate to="/login" replace />
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
                  <Suspense fallback={<div className="p-8 text-muted-foreground">Cargando...</div>}>
                    <DashboardPage />
                  </Suspense>
                </RutaPrivada>
              }
            />
            <Route
              path="/anulados/:sucursal"
              element={
                <RutaPrivada>
                  <Suspense fallback={<div className="p-8 text-muted-foreground">Cargando...</div>}>
                    <AnuladosPage />
                  </Suspense>
                </RutaPrivada>
              }
            />
          </Routes>
        </AuthProvider>
      </TenantProvider>
    </BrowserRouter>
  )
}

export default App
