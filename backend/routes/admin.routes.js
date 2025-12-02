import express from 'express';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /admin/stats
router.get('/admin/stats', auth, async (req, res) => {
  try {
    const eventosRes = await pool.query('SELECT COUNT(*) AS total FROM eventos');
    const usuariosRes = await pool.query(
      'SELECT COUNT(*) AS total FROM usuarios'
    );
    const ventasRes = await pool.query(
      "SELECT COALESCE(SUM(precio),0) AS total FROM boletos WHERE estado = 'comprado'"
    );

    res.json({
      eventos: parseInt(eventosRes.rows[0].total, 10) || 0,
      usuarios: parseInt(usuariosRes.rows[0].total, 10) || 0,
      ventas: Number(ventasRes.rows[0].total) || 0,
    });
  } catch (err) {
    console.error('GET /admin/stats error', err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// GET /admin/users
router.get('/admin/users', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.rol_id, r.nombre_rol AS rol_nombre
       FROM usuarios u
       LEFT JOIN roles r ON r.id = u.rol_id
       ORDER BY u.id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /admin/users error', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// PATCH /admin/users/:id/role
router.patch('/admin/users/:id/role', auth, async (req, res) => {
  const { id } = req.params;
  const { rol_id } = req.body;
  if (!rol_id) {
    return res.status(400).json({ error: 'rol_id requerido' });
  }
  try {
    const result = await pool.query(
      'UPDATE usuarios SET rol_id = $1 WHERE id = $2 RETURNING id, rol_id',
      [rol_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PATCH /admin/users/:id/role error', err);
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
});

export default router;
