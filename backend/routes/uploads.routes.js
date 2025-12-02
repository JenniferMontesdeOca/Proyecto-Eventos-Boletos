// backend/routes/uploads.routes.js
import express from 'express'
import path from 'path'
import multer from 'multer'
import pool from '../db.js'
import auth from '../middleware/auth.js'
import { requireRole } from '../middleware/roles.js'

const router = express.Router()

const uploadsDir = process.env.UPLOADS_DIR || 'uploads'

// --- multer ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname || '')
    cb(null, `evento-${unique}${ext}`)
  },
})

const upload = multer({ storage })

/* ===========================
   LISTAR IMÁGENES DE UN EVENTO
   GET /events/:id/imagenes
=========================== */
router.get('/events/:id/imagenes', async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      'SELECT * FROM imagenes_evento WHERE evento_id = $1 ORDER BY es_principal DESC, id ASC',
      [id]
    )

    res.json(result.rows)
  } catch (err) {
    console.error('GET /events/:id/imagenes error', err)
    res.status(500).json({ error: 'Error al obtener imágenes del evento' })
  }
})

/* ===========================
   SUBIR IMÁGENES DE UN EVENTO
   POST /events/:id/imagenes
   (Admin u organizador)
=========================== */
router.post(
  '/events/:id/imagenes',
  auth,
  requireRole([3]), // solo admin; cambia a [2,3] si quieres incluir organizador
  upload.array('imagenes', 10),
  async (req, res) => {
    try {
      const { id } = req.params
      const files = req.files || []

      if (!files.length) {
        return res.status(400).json({ error: 'No se enviaron imágenes' })
      }

      const creadas = []

      for (const file of files) {
        const nombreArchivo = file.filename
        const fileUrl = `/${uploadsDir}/${nombreArchivo}`

        const result = await pool.query(
          `INSERT INTO imagenes_evento
           (evento_id, url_imagen, nombre_archivo, es_principal)
           VALUES ($1,$2,$3,$4)
           RETURNING *`,
          [id, fileUrl, nombreArchivo, false] // nuevas imágenes NO son principales
        )

        creadas.push(result.rows[0])
      }

      res.status(201).json(creadas)
    } catch (err) {
      console.error('POST /events/:id/imagenes error', err)
      res.status(500).json({ error: 'Error al subir imagen' })
    }
  }
)

/* ===========================
   ELIMINAR IMAGEN
   DELETE /imagenes/:id
=========================== */
router.delete(
  '/imagenes/:id',
  auth,
  requireRole([3]),
  async (req, res) => {
    try {
      const { id } = req.params

      const result = await pool.query(
        'DELETE FROM imagenes_evento WHERE id = $1 RETURNING id',
        [id]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Imagen no encontrada' })
      }

      // (Opcional: aquí podrías borrar también el archivo físico si quieres)
      res.json({ ok: true })
    } catch (err) {
      console.error('DELETE /imagenes/:id error', err)
      res.status(500).json({ error: 'Error al eliminar imagen' })
    }
  }
)

/* ===========================
   MARCAR IMAGEN COMO PRINCIPAL
   PUT /imagenes/:id/principal
=========================== */
router.put(
  '/imagenes/:id/principal',
  auth,
  requireRole([3]),
  async (req, res) => {
    try {
      const { id } = req.params

      // 1) obtener el evento al que pertenece esta imagen
      const imgRes = await pool.query(
        'SELECT evento_id FROM imagenes_evento WHERE id = $1',
        [id]
      )
      if (imgRes.rows.length === 0) {
        return res.status(404).json({ error: 'Imagen no encontrada' })
      }
      const eventoId = imgRes.rows[0].evento_id

      // 2) poner todas las imágenes de ese evento como no principales
      await pool.query(
        'UPDATE imagenes_evento SET es_principal = FALSE WHERE evento_id = $1',
        [eventoId]
      )

      // 3) marcar esta como principal
      const result = await pool.query(
        'UPDATE imagenes_evento SET es_principal = TRUE WHERE id = $1 RETURNING *',
        [id]
      )

      res.json(result.rows[0])
    } catch (err) {
      console.error('PUT /imagenes/:id/principal error', err)
      res.status(500).json({ error: 'Error al marcar como principal' })
    }
  }
)

export default router
