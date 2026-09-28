import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Sucursal = string

export type Usuario = {
  usuario: string
  sucursales: Sucursal[] | 'todas'
}

type AuthContextValue = {
  usuario: Usuario | null
  cargando: boolean
  login: (usuario: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then(setUsuario)
      .finally(() => setCargando(false))

    const onExpired = () => setUsuario(null)
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  async function login(usuarioLogin: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ usuario: usuarioLogin, password }),
    })
    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error ?? 'Error al iniciar sesión')
    }
    setUsuario(await res.json())
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
