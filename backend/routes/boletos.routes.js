// backend/routes/boletos.routes.js
import { Router } from 'express'
import pool from '../db.js'
import auth from '../middleware/auth.js'

const router = Router()

router.post('/comprar', auth, async (req, res) => {
  const { evento_id, cantidad = 1, localidad_id } = req.body
  const qty = Number(cantidad) || 1

  if (qty < 1) {
    return res.status(400).json({ error: 'Cantidad inválida' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 1) Bloquear evento
    const { rows: eventos } = await client.query(
      'SELECT * FROM eventos WHERE id=$1 FOR UPDATE',
      [evento_id]
    )
    const evento = eventos[0]

    if (!evento || !evento.activo) {
      throw new Error('Evento no disponible')
    }

    let precioUnitario = Number(evento.precio_base || 0)

    // 2) Si hay localidad, la usamos
    if (localidad_id) {
      const { rows: locs } = await client.query(
        'SELECT * FROM localidades_evento WHERE id = $1 AND evento_id = $2 FOR UPDATE',
        [localidad_id, evento_id]
      )

      if (locs.length === 0) {
        throw new Error('Localidad no válida para este evento')
      }

      const loc = locs[0]

      if (Number(loc.boletos_disponibles) < qty) {
        throw new Error('No hay suficientes boletos')
      }

      precioUnitario = Number(loc.precio || 0)

      // Descontar de la localidad
      await client.query(
        'UPDATE localidades_evento SET boletos_disponibles = boletos_disponibles - $1 WHERE id = $2',
        [qty, localidad_id]
      )
    } else {
      // Sin localidad: validamos solo stock general del evento
      if (Number(evento.boletos_disponibles) < qty) {
        throw new Error('No hay suficientes boletos')
      }
    }

    // 3) Descontar del total del evento
    await client.query(
      'UPDATE eventos SET boletos_disponibles = boletos_disponibles - $1 WHERE id=$2',
      [qty, evento_id]
    )

    // 4) Insertar N boletos, cada uno con localidad y precio correcto
    const values = []
    const params = []
    let i = 1

    for (let k = 0; k < qty; k++) {
      values.push(`($${i++}, $${i++}, $${i++}, NOW(), $${i++}, 'comprado')`)
      // evento_id, usuario_id, localidad_id, precio
      params.push(evento_id, req.user.id, localidad_id || null, precioUnitario)
    }

    const { rows: boletos } = await client.query(
      `INSERT INTO boletos (evento_id, usuario_id, localidad_id, fecha_compra, precio, estado)
       VALUES ${values.join(', ')}
       RETURNING *`,
      params
    )

    // 5) Registrar transacción con el monto total
    const montoTotal = precioUnitario * qty

    await client.query(
      'INSERT INTO transacciones (usuario_id, evento_id, monto, tipo) VALUES ($1,$2,$3,$4)',
      [req.user.id, evento_id, montoTotal, 'compra']
    )

    await client.query('COMMIT')
    res.json({ ok: true, boletos })
  } catch (e) {
    await client.query('ROLLBACK')
    res.status(400).json({ error: e.message })
  } finally {
    client.release()
  }
})

router.get('/mios', auth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT
       b.*,
       e.nombre AS evento_nombre,
       e.fecha  AS evento_fecha,
       e.hora   AS evento_hora,
       e.ubicacion,
       l.nombre AS localidad_nombre,
       l.precio AS localidad_precio
     FROM boletos b
     JOIN eventos e
       ON e.id = b.evento_id
     LEFT JOIN localidades_evento l
       ON l.id = b.localidad_id
     WHERE b.usuario_id = $1
     ORDER BY b.fecha_compra DESC`,
    [req.user.id]
  )
  res.json(rows)
})

export default router
