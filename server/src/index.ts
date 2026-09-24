import 'dotenv/config'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { authRouter } from './rutas/auth.js'
import { dashboardRouter } from './rutas/dashboard.js'
import { anuladosRouter } from './rutas/anulados.js'

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: true, credentials: true }))

app.use('/api/auth', authRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/anulados', anuladosRouter)

const PORT = process.env.PORT ?? 3001
app.listen(PORT, () => {
  console.log(`Server escuchando en puerto ${PORT}`)
})
