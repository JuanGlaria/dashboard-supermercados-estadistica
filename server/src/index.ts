import 'dotenv/config'
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
  const requeridas = ['JWT_SECRET', 'SUCURSALES', 'LOGIN_ADMIN_USER', 'LOGIN_ADMIN_PASSWORD']
  for (const id of SUCURSAL_IDS) {
    const s = id.toUpperCase()
    requeridas.push(`DB_${s}_SERVER`, `DB_${s}_DATABASE`, `DB_${s}_USER`, `DB_${s}_PASSWORD`, `LOGIN_${s}_USER`, `LOGIN_${s}_PASSWORD`)
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
app.use(helmet())
app.use(express.json())
app.use(cookieParser())
if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))
}

app.use('/api/auth', authRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/anulados', anuladosRouter)
app.use('/api/config', configRouter)

const PORT = process.env.PORT ?? 3001
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
