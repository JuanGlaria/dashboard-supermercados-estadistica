import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { buscarUsuarioSecr } from '../auth/usuarios.js'
import { COOKIE_NAME, firmarToken } from '../auth/jwt.js'
import { requiereLogin } from '../auth/middleware.js'

export const authRouter = Router()

const COOKIE_PATH = process.env.COOKIE_PATH || process.env.BASE_PATH?.replace(/\/+$/, '') || '/'
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

authRouter.post('/login', limiteLogin, async (req, res) => {
  const { usuario, password } = req.body as { usuario?: unknown; password?: unknown }
  let encontrado
  try {
    encontrado =
      typeof usuario === 'string' && typeof password === 'string'
        ? await buscarUsuarioSecr(usuario, password)
        : undefined
  } catch (err) {
    console.error('[login] error consultando casa central', err)
    res.status(502).json({ error: 'No se pudo validar el usuario, probá de nuevo' })
    return
  }

  if (!encontrado) {
    res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
    return
  }

  if (!encontrado.autorizado) {
    res.status(403).json({ error: 'No tenés autorización para acceder al panel. Hablá con el administrador.' })
    return
  }

  const sucursales = 'todas'
  const token = firmarToken({ usuario: encontrado.usuario, sucursales })
  res.cookie(COOKIE_NAME, token, { ...opcionesCookie, maxAge: 7 * 24 * 60 * 60 * 1000 })
  res.json({ usuario: encontrado.usuario, sucursales })
})

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, opcionesCookie)
  res.json({ ok: true })
})

authRouter.get('/me', requiereLogin, (req, res) => {
  res.json(req.usuario)
})
