import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type TenantConfig = {
  nombreCliente: string
  logoUrl: string | null
  faviconUrl: string | null
  colorPrimary: string | null
  sucursales: { id: string; nombre: string }[]
}

const DEFAULT_CONFIG: TenantConfig = {
  nombreCliente: 'Panel Estadístico',
  logoUrl: null,
  faviconUrl: null,
  colorPrimary: null,
  sucursales: [],
}

const TenantContext = createContext<TenantConfig>(DEFAULT_CONFIG)

export function TenantProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<TenantConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: TenantConfig | null) => {
        if (!data) return
        setConfig(data)
        document.title = data.nombreCliente
        if (data.colorPrimary) {
          document.documentElement.style.setProperty('--primary', data.colorPrimary)
        }
        if (data.faviconUrl) {
          const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
          if (favicon) favicon.href = data.faviconUrl
        }
      })
      .catch(() => {})
  }, [])

  return <TenantContext.Provider value={config}>{children}</TenantContext.Provider>
}

export function useTenant() {
  return useContext(TenantContext)
}
