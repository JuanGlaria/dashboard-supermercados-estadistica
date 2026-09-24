import type { NextFunction, Request, Response } from 'express'
import type { Sucursal } from '../db/config.js'
import { COOKIE_NAME, verificarToken, type TokenPayload } from './jwt.js'

declare global {
  namespace Express {
    interface Request {
      usuario?: TokenPayload
    }
  }
}

export function requiereLogin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies[COOKIE_NAME]
  if (!token) {
    res.status(401).json({ error: 'No autenticado' })
    return
  }
  try {
    req.usuario = verificarToken(token)
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

export function requiereAccesoSucursal(req: Request, res: Response, next: NextFunction) {
  const sucursal = req.params.sucursal as Sucursal
  const permitidas = req.usuario!.sucursales
  if (permitidas !== 'todas' && !permitidas.includes(sucursal)) {
    res.status(403).json({ error: 'Sin acceso a esta sucursal' })
    return
  }
  next()
}
