import jwt from 'jsonwebtoken'
import type { Sucursal } from '../config/sucursales.js'

const SECRET = process.env.JWT_SECRET!
const COOKIE_NAME = 'sj_dash_token'
const EXPIRACION = '7d'

export type TokenPayload = {
  usuario: string
  sucursales: Sucursal[] | 'todas'
}

export function firmarToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRACION })
}

export function verificarToken(token: string): TokenPayload {
  return jwt.verify(token, SECRET) as TokenPayload
}

export { COOKIE_NAME }
