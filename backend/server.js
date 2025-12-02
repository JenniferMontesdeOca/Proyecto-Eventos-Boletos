// backend/server.js
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
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// archivos estáticos de imágenes
app.use(
  '/uploads',
  express.static(process.env.UPLOADS_DIR || 'uploads')
)

/* ====== RUTAS ====== */

// autenticación -> /auth/register, /auth/login
app.use('/auth', authRoutes)

// admin -> /admin/stats, /admin/users, etc.
app.use('/', adminRoutes)

// eventos -> /events, /events/:id, /events/:id/localidades, etc.
app.use('/', eventosRoutes)

// categorías -> /categorias, /categorias/:id
app.use('/categorias', categoriasRoutes)

// boletos -> /boletos/comprar, /boletos/mios
app.use('/boletos', boletosRoutes)

// imágenes -> /events/:id/imagenes, /imagenes/:id, etc.
app.use('/', uploadsRoutes)

// pequeño ping para probar que vive
app.get('/', (req, res) => {
  res.json({ ok: true, msg: 'API eventos-boletos OK' })
})

app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`)
})
