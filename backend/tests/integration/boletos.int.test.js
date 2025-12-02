// backend/tests/integration/boletos.int.test.js
import request from 'supertest'
import app from '../../testApp.js'
import pool from '../../db.js'

describe('Compra de boletos (integración)', () => {
  const adminEmail = `jest_admin_boletos_${Date.now()}@example.com`
  const adminPassword = '123456'
  let adminToken
  let categoriaId
  let eventoId
  let localidadId
  let adminUserId

  const cantidadCompra = 2

  beforeAll(async () => {
    // 1) Admin
    const resRegister = await request(app).post('/auth/register').send({
      nombre: 'Admin Boletos Jest',
      email: adminEmail,
      password: adminPassword,
      rol_id: 3,
    })

    expect(resRegister.statusCode).toBe(200)

    const resLogin = await request(app).post('/auth/login').send({
      email: adminEmail,
      password: adminPassword,
    })

    expect(resLogin.statusCode).toBe(200)
    adminToken = resLogin.body.token
    adminUserId = resLogin.body.user.id

    // 2) Categoría
    const resCat = await request(app)
      .post('/categorias')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Categoria Boletos Jest' })

    expect(resCat.statusCode).toBe(200)
    categoriaId = resCat.body.id

    // 3) Evento
    const resEvento = await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Evento Boletos Jest',
        descripcion: 'Evento para probar compra de boletos',
        fecha: '2030-02-01',
        hora: '20:00',
        ubicacion: 'Ciudad Boletos',
        capacidad_total: 50,
        boletos_disponibles: 50,
        categoria_id: categoriaId,
        precio_base: 100,
        localidad_principal: 'General',
      })

    expect(resEvento.statusCode).toBe(201)
    eventoId = resEvento.body.id

    // 4) Localidad
    const resLoc = await request(app)
      .post(`/events/${eventoId}/localidades`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'VIP Jest',
        precio: 150,
        capacidad: 10,
        boletos_disponibles: 10,
      })

    expect(resLoc.statusCode).toBe(201)
    localidadId = resLoc.body.id
  })

  afterAll(async () => {
    await pool.query('DELETE FROM boletos WHERE evento_id = $1', [eventoId])
    await pool.query('DELETE FROM transacciones WHERE evento_id = $1', [eventoId])
    await pool.query('DELETE FROM localidades_evento WHERE evento_id = $1', [eventoId])
    await pool.query('DELETE FROM eventos WHERE id = $1', [eventoId])
    await pool.query('DELETE FROM categorias WHERE id = $1', [categoriaId])
    await pool.query('DELETE FROM usuarios WHERE email = $1', [adminEmail])
  })

  test('Compra de ticket → 200, boletos en DB y capacidad decrementada', async () => {
    const resCompra = await request(app)
      .post('/boletos/comprar')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        evento_id: eventoId,
        cantidad: cantidadCompra,
        localidad_id: localidadId,
      })

    // Tu endpoint hoy devuelve 200 (no 201)
    expect(resCompra.statusCode).toBe(200)
    expect(resCompra.body).toHaveProperty('ok', true)
    expect(Array.isArray(resCompra.body.boletos)).toBe(true)
    expect(resCompra.body.boletos.length).toBe(cantidadCompra)

    // Verificar boletos en DB
    const { rows: boletosRows } = await pool.query(
      'SELECT * FROM boletos WHERE evento_id = $1 AND usuario_id = $2',
      [eventoId, adminUserId]
    )

    expect(boletosRows.length).toBeGreaterThanOrEqual(cantidadCompra)

    // Verificar capacidad de localidad
    const { rows: locRows } = await pool.query(
      'SELECT boletos_disponibles FROM localidades_evento WHERE id = $1',
      [localidadId]
    )

    expect(locRows.length).toBe(1)
    expect(Number(locRows[0].boletos_disponibles)).toBe(10 - cantidadCompra)

    // Verificar capacidad total del evento
    const { rows: evRows } = await pool.query(
      'SELECT boletos_disponibles FROM eventos WHERE id = $1',
      [eventoId]
    )

    expect(evRows.length).toBe(1)
    expect(Number(evRows[0].boletos_disponibles)).toBe(50 - cantidadCompra)
  })
})
