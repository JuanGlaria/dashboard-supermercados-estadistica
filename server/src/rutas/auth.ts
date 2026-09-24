import { Router } from 'express'
import { USUARIOS } from '../auth/usuarios.js'
import { COOKIE_NAME, firmarToken } from '../auth/jwt.js'
import { requiereLogin } from '../auth/middleware.js'

export const authRouter = Router()

authRouter.post('/login', (req, res) => {
  const { usuario, password } = req.body as { usuario?: string; password?: string }
  const encontrado = USUARIOS.find((u) => u.usuario === usuario && u.password === password)

  if (!encontrado) {
    res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
    return
  }

  const token = firmarToken({ usuario: encontrado.usuario, sucursales: encontrado.sucursales })
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
  res.json({ usuario: encontrado.usuario, sucursales: encontrado.sucursales })
})

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME)
  res.json({ ok: true })
})

authRouter.get('/me', requiereLogin, (req, res) => {
  res.json(req.usuario)
})
