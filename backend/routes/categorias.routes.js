import { Router } from 'express'
import pool from '../db.js'
import auth from '../middleware/auth.js'
import { requireRole } from '../middleware/roles.js'

const router = Router()

/* ===========================
   OBTENER TODAS LAS CATEGORÍAS (PÚBLICO)
=========================== */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categorias ORDER BY id ASC'
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener categorías' })
  }
})

/* ===========================
   CREAR CATEGORÍA (ADMIN)
=========================== */
router.post('/', auth, requireRole([3]), async (req, res) => {
  const { nombre } = req.body

  try {
    const result = await pool.query(
      'INSERT INTO categorias (nombre) VALUES ($1) RETURNING *',
      [nombre]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al crear la categoría' })
  }
})

/* ===========================
   EDITAR CATEGORÍA (ADMIN)
=========================== */
router.put('/:id', auth, requireRole([3]), async (req, res) => {
  const { id } = req.params
  const { nombre } = req.body

  try {
    const result = await pool.query(
      'UPDATE categorias SET nombre=$1 WHERE id=$2 RETURNING *',
      [nombre, id]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar categoría' })
  }
})

/* ===========================
   ELIMINAR CATEGORÍA (ADMIN)
=========================== */
router.delete('/:id', auth, requireRole([3]), async (req, res) => {
  const { id } = req.params

  try {
    await pool.query('DELETE FROM categorias WHERE id=$1', [id])
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al eliminar categoría' })
  }
})

export default router
