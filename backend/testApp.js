// backend/testApp.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes.js'
import adminRoutes from './routes/admin.routes.js'
import eventosRoutes from './routes/eventos.routes.js'
import categoriasRoutes from './routes/categorias.routes.js'
import boletosRoutes from './routes/boletos.routes.js'
import uploadsRoutes from './routes/uploads.routes.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Montaje de rutas igual que en server.js
app.use('/auth', authRoutes)
app.use('/admin', adminRoutes)
app.use('/categorias', categoriasRoutes)
app.use('/boletos', boletosRoutes)
app.use('/', eventosRoutes)
app.use('/', uploadsRoutes)

// endpoint simple de salud (opcional)
app.get('/health', (req, res) => {
  res.json({ ok: true })
})

export default app
