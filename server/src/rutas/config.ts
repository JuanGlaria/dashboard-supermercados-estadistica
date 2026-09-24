import { Router } from 'express'
import { getTenantConfig } from '../config/tenant.js'

export const configRouter = Router()

configRouter.get('/', (_req, res) => {
  res.json(getTenantConfig())
})
