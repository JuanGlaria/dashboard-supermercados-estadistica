import { createHash, timingSafeEqual } from 'node:crypto'
import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { USUARIOS } from '../auth/usuarios.js'
import { COOKIE_NAME, firmarToken } from '../auth/jwt.js'
import { requiereLogin } from '../auth/middleware.js'

export const authRouter = Router()

const COOKIE_PATH = process.env.COOKIE_PATH ?? '/'
const opcionesCookie = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: COOKIE_PATH,
} as const

const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos, probá de nuevo en unos minutos' },
})

function igual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

authRouter.post('/login', limiteLogin, (req, res) => {
  const { usuario, password } = req.body as { usuario?: unknown; password?: unknown }
  const encontrado =
    typeof usuario === 'string' && typeof password === 'string'
      ? USUARIOS.find((u) => igual(u.usuario, usuario) && igual(u.password, password))
      : undefined

  if (!encontrado) {
    res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
    return
  }

  const token = firmarToken({ usuario: encontrado.usuario, sucursales: encontrado.sucursales })
  res.cookie(COOKIE_NAME, token, { ...opcionesCookie, maxAge: 7 * 24 * 60 * 60 * 1000 })
  res.json({ usuario: encontrado.usuario, sucursales: encontrado.sucursales })
})

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, opcionesCookie)
  res.json({ ok: true })
})

authRouter.get('/me', requiereLogin, (req, res) => {
  res.json(req.usuario)
})
