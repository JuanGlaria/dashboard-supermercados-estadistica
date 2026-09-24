import { SUCURSAL_IDS, type Sucursal } from '../config/sucursales.js'

export type Usuario = {
  usuario: string
  password: string
  sucursales: Sucursal[] | 'todas'
}

const usuariosPorSucursal: Usuario[] = SUCURSAL_IDS.map((id) => ({
  usuario: process.env[`LOGIN_${id.toUpperCase()}_USER`]!,
  password: process.env[`LOGIN_${id.toUpperCase()}_PASSWORD`]!,
  sucursales: [id],
}))

export const USUARIOS: Usuario[] = [
  ...usuariosPorSucursal,
  {
    usuario: process.env.LOGIN_ADMIN_USER!,
    password: process.env.LOGIN_ADMIN_PASSWORD!,
    sucursales: 'todas',
  },
]
