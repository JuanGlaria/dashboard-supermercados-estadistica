import 'dotenv/config'
import path from 'node:path'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { authRouter } from './rutas/auth.js'
import { dashboardRouter } from './rutas/dashboard.js'
import { anuladosRouter } from './rutas/anulados.js'
import { configRouter } from './rutas/config.js'
import { SUCURSAL_IDS } from './config/sucursales.js'
import { cerrarPools } from './db/pool.js'

process.env.TZ ||= 'America/Argentina/Buenos_Aires'

function validarEnv() {
  const requeridas = ['JWT_SECRET', 'SUCURSALES', 'DB_CASA_CENTRAL_SERVER', 'DB_CASA_CENTRAL_DATABASE', 'DB_CASA_CENTRAL_USER', 'DB_CASA_CENTRAL_PASSWORD']
  for (const id of SUCURSAL_IDS) {
    const s = id.toUpperCase()
    requeridas.push(`DB_${s}_SERVER`, `DB_${s}_DATABASE`, `DB_${s}_USER`, `DB_${s}_PASSWORD`)
  }
  const faltan = requeridas.filter((k) => !process.env[k])
  if (faltan.length > 0) {
    console.error(`Faltan variables de entorno: ${faltan.join(', ')}`)
    process.exit(1)
  }
}

validarEnv()

const app = express()

app.set('trust proxy', 1)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: { 'img-src': ["'self'", 'data:', 'https:'] },
    },
  }),
)
app.use(express.json())
app.use(cookieParser())
if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))
}

const BASE_PATH = (process.env.BASE_PATH ?? '').replace(/\/+$/, '')
const CLIENT_DIST = path.resolve(import.meta.dirname, '../../client/dist')

const rutas = express.Router()
rutas.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})
rutas.use('/api/auth', authRouter)
rutas.use('/api/dashboard', dashboardRouter)
rutas.use('/api/anulados', anuladosRouter)
rutas.use('/api/config', configRouter)
rutas.use(express.static(CLIENT_DIST))
rutas.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/') || path.extname(req.path)) return next()
  res.sendFile(path.join(CLIENT_DIST, 'index.html'), (err) => {
    if (err) next()
  })
})

app.use(BASE_PATH || '/', rutas)

const PORT = process.env.PORT || 6001
const server = app.listen(PORT, () => {
  console.log(`Server escuchando en puerto ${PORT}`)
})

function apagar() {
  server.close(() => {
    void cerrarPools().finally(() => process.exit(0))
  })
}
process.on('SIGTERM', apagar)
process.on('SIGINT', apagar)
