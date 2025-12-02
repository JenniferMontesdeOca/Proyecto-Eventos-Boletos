import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const router = Router();

/* ========== REGISTRO ========== */
router.post('/register', async (req, res) => {
  const { nombre, email, password, rol_id } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol_id)
       VALUES ($1,$2,$3, COALESCE($4,1))
       RETURNING id, nombre, email, rol_id`,
      [nombre, email, hash, rol_id]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error('POST /auth/register error', e);
    res.status(400).json({ error: 'Email ya registrado o datos inválidos' });
  }
});

/* ========== LOGIN ========== */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    const user = rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, rol_id: user.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol_id: user.rol_id,
      },
    });
  } catch (err) {
    console.error('POST /auth/login error', err);
    res.status(500).json({ error: 'Error en el login' });
  }
});

/* ========== OBTENER PERFIL ========== */
// Ruta final: GET /auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT id, nombre, email, rol_id FROM usuarios WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /auth/me error', err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

/* ========== ACTUALIZAR PERFIL ========== */
// Ruta final: PUT /auth/me
router.put('/me', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre, email } = req.body;

    if (!nombre || !email) {
      return res
        .status(400)
        .json({ error: 'Nombre y correo son obligatorios' });
    }

    const result = await pool.query(
      `UPDATE usuarios
       SET nombre = $1,
           email  = $2
       WHERE id = $3
       RETURNING id, nombre, email, rol_id`,
      [nombre, email, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /auth/me error', err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

/* ========== CAMBIAR CONTRASEÑA ========== */
// Ruta final: PUT /auth/change-password
router.put('/change-password', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { actual, nueva } = req.body;

    if (!actual || !nueva) {
      return res
        .status(400)
        .json({ error: 'Contraseña actual y nueva son obligatorias' });
    }

    if (nueva.length < 6) {
      return res
        .status(400)
        .json({
          error: 'La nueva contraseña debe tener al menos 6 caracteres',
        });
    }

    const userRes = await pool.query(
      'SELECT id, password_hash FROM usuarios WHERE id = $1',
      [userId]
    );
    const user = userRes.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const ok = await bcrypt.compare(actual, user.password_hash);
    if (!ok) {
      return res
        .status(400)
        .json({ error: 'La contraseña actual no es correcta' });
    }

    const newHash = await bcrypt.hash(nueva, 10);
    await pool.query(
      'UPDATE usuarios SET password_hash = $1 WHERE id = $2',
      [newHash, userId]
    );

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('PUT /auth/change-password error', err);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
});

export default router;
