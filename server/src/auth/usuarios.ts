import type { Sucursal } from '../db/config.js'

export type Usuario = {
  usuario: string
  password: string
  sucursales: Sucursal[] | 'todas'
}

export const USUARIOS: Usuario[] = [
  {
    usuario: process.env.LOGIN_LAVALLE_USER!,
    password: process.env.LOGIN_LAVALLE_PASSWORD!,
    sucursales: ['lavalle'],
  },
  {
    usuario: process.env.LOGIN_SAVIO_USER!,
    password: process.env.LOGIN_SAVIO_PASSWORD!,
    sucursales: ['savio'],
  },
  {
    usuario: process.env.LOGIN_SOMISA_USER!,
    password: process.env.LOGIN_SOMISA_PASSWORD!,
    sucursales: ['somisa'],
  },
  {
    usuario: process.env.LOGIN_IVAN_USER!,
    password: process.env.LOGIN_IVAN_PASSWORD!,
    sucursales: 'todas',
  },
]
