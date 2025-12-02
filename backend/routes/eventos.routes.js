import express from 'express';
import pool from '../db.js';
import auth from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = express.Router();

/* ===========================
   LISTAR EVENTOS (paginado + filtros)
=========================== */
router.get('/events', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      date_from,
      date_to,
      location,
      price_min,
      price_max,
      organizer,
      search,
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const where = [];
    const values = [];
    let idx = 1;

    if (category) {
      where.push(`e.categoria_id = $${idx++}`);
      values.push(category);
    }

    if (date_from) {
      where.push(`e.fecha >= $${idx++}`);
      values.push(date_from);
    }

    if (date_to) {
      where.push(`e.fecha <= $${idx++}`);
      values.push(date_to);
    }

    if (location) {
      where.push(`LOWER(e.ubicacion) LIKE LOWER('%' || $${idx++} || '%')`);
      values.push(location);
    }

    if (price_min) {
      where.push(`e.precio_base >= $${idx++}`);
      values.push(price_min);
    }

    if (price_max) {
      where.push(`e.precio_base <= $${idx++}`);
      values.push(price_max);
    }

    if (organizer) {
      where.push(`e.organizador_id = $${idx++}`);
      values.push(organizer);
    }

    if (search) {
      where.push(
        `(LOWER(e.nombre) LIKE LOWER('%' || $${idx} || '%')
          OR LOWER(e.descripcion) LIKE LOWER('%' || $${idx} || '%'))`
      );
      values.push(search);
      idx++;
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM eventos e
      ${whereClause};
    `;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total, 10) || 0;

    // 🔹 AQUÍ VIENE EL CAMBIO IMPORTANTE
    const eventsQuery = `
      SELECT
        e.*,
        c.nombre AS categoria_nombre,
        COALESCE(
          (
            SELECT json_agg(img ORDER BY img.es_principal DESC, img.id ASC)
            FROM imagenes_evento img
            WHERE img.evento_id = e.id
          ),
          '[]'::json
        ) AS imagenes
      FROM eventos e
      LEFT JOIN categorias c ON c.id = e.categoria_id
      ${whereClause}
      ORDER BY e.fecha ASC, e.hora ASC NULLS LAST
      LIMIT ${limitNum} OFFSET ${offset};
    `;
    const eventsResult = await pool.query(eventsQuery, values);

    res.json({
      items: eventsResult.rows,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('GET /events error', err);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

/* ===========================
   DETALLE EVENTO + IMÁGENES
=========================== */
router.get('/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const eventRes = await pool.query(
      `SELECT e.*, c.nombre AS categoria_nombre
       FROM eventos e
       LEFT JOIN categorias c ON c.id = e.categoria_id
       WHERE e.id = $1`,
      [id]
    );

    if (eventRes.rows.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const imagenesRes = await pool.query(
      'SELECT * FROM imagenes_evento WHERE evento_id = $1 ORDER BY es_principal DESC, id ASC',
      [id]
    );

    const locRes = await pool.query(
      'SELECT * FROM localidades_evento WHERE evento_id = $1 ORDER BY precio ASC',
      [id]
    );

    res.json({
      ...eventRes.rows[0],
      imagenes: imagenesRes.rows,
      localidades: locRes.rows,
    });
  } catch (err) {
    console.error('GET /events/:id error', err);
    res.status(500).json({ error: 'Error al obtener el evento' });
  }
});

/* ===========================
   CREAR EVENTO (organizador/admin)
=========================== */
/* ===========================
   CREAR EVENTO (organizador/admin)
=========================== */
/* ===========================
   CREAR EVENTO (organizador/admin)
=========================== */
router.post('/events', auth, requireRole([2, 3]), async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      fecha,
      hora,
      ubicacion,
      capacidad_total,
      boletos_disponibles,
      categoria_id,
      precio_base,
      localidad_principal,
    } = req.body;

    // 👇 id del usuario autenticado (organizador/admin)
    const organizadorId = req.user.id;

    const result = await pool.query(
      `INSERT INTO eventos
        (nombre,
         descripcion,
         fecha,
         hora,
         ubicacion,
         capacidad_total,
         boletos_disponibles,
         categoria_id,
         precio_base,
         localidad_principal,
         organizador_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        nombre,
        descripcion || '',
        fecha,
        hora,
        ubicacion,
        capacidad_total,
        boletos_disponibles,
        categoria_id,
        precio_base ?? null,
        localidad_principal || null,
        organizadorId,          // 👈 aquí va el user id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /events error', err);
    res.status(500).json({ error: err.message, detail: err.detail });
  }
});


/* ===========================
   ACTUALIZAR EVENTO (organizador/admin)
=========================== */
router.put('/events/:id', auth, requireRole([2, 3]), async (req, res) => {
  const { id } = req.params;
  try {
    const {
      nombre,
      descripcion,
      fecha,
      hora,
      ubicacion,
      capacidad_total,
      boletos_disponibles,
      categoria_id,
      precio_base,
      localidad_principal,
    } = req.body;

    const result = await pool.query(
      `UPDATE eventos
       SET nombre = $1,
           descripcion = $2,
           fecha = $3,
           hora = $4,
           ubicacion = $5,
           capacidad_total = $6,
           boletos_disponibles = $7,
           categoria_id = $8,
           precio_base = $9,
           localidad_principal = $10
       WHERE id = $11
       RETURNING *`,
      [
        nombre,
        descripcion || '',
        fecha,
        hora,
        ubicacion,
        capacidad_total,
        boletos_disponibles,
        categoria_id,
        precio_base ?? null,
        localidad_principal || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /events/:id error', err);
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
});

/* ===========================
   ELIMINAR EVENTO (organizador/admin)
=========================== */
router.delete('/events/:id', auth, requireRole([2, 3]), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM eventos WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json({ message: 'Evento eliminado' });
  } catch (err) {
    console.error('DELETE /events/:id error', err);
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
});

/* ============================================================
   LOCALIDADES POR EVENTO (precios y zonas)
============================================================ */

/* Listar localidades de un evento */
router.get('/events/:id/localidades', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM localidades_evento WHERE evento_id = $1 ORDER BY precio ASC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /events/:id/localidades error', err);
    res.status(500).json({ error: 'Error al obtener localidades' });
  }
});

/* Crear localidad para un evento (organizador/admin) */
router.post(
  '/events/:id/localidades',
  auth,
  requireRole([2, 3]),
  async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, capacidad, boletos_disponibles } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO localidades_evento
         (evento_id, nombre, precio, capacidad, boletos_disponibles)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING *`,
        [
          id,
          nombre,
          precio,
          capacidad ?? 0,
          boletos_disponibles ?? capacidad ?? 0,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('POST /events/:id/localidades error', err);
      res.status(500).json({ error: 'Error al crear localidad' });
    }
  }
);

/* Actualizar localidad (organizador/admin) */
router.put(
  '/localidades/:id',
  auth,
  requireRole([2, 3]),
  async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, capacidad, boletos_disponibles } = req.body;

    try {
      const result = await pool.query(
        `UPDATE localidades_evento
         SET nombre = $1,
             precio = $2,
             capacidad = $3,
             boletos_disponibles = $4
         WHERE id = $5
         RETURNING *`,
        [nombre, precio, capacidad, boletos_disponibles, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Localidad no encontrada' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('PUT /localidades/:id error', err);
      res.status(500).json({ error: 'Error al actualizar localidad' });
    }
  }
);

/* Eliminar localidad (organizador/admin) */
router.delete(
  '/localidades/:id',
  auth,
  requireRole([2, 3]),
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        'DELETE FROM localidades_evento WHERE id = $1 RETURNING id',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Localidad no encontrada' });
      }
      res.json({ message: 'Localidad eliminada' });
    } catch (err) {
      console.error('DELETE /localidades/:id error', err);
      res.status(500).json({ error: 'Error al eliminar localidad' });
    }
  }
);

export default router;
