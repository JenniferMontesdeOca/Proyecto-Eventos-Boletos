// backend/tests/integration/eventos.int.test.js
import request from 'supertest'
import app from '../../testApp.js'
import pool from '../../db.js'

describe('Eventos integration', () => {
  const adminEmail = `jest_admin_${Date.now()}@example.com`
  const adminPassword = '123456'
  let adminToken
  let categoriaId
  let eventoId
  const nombreEvento = 'Evento Jest Integración'

  beforeAll(async () => {
    // Crear admin (rol_id = 3)
    const resRegister = await request(app).post('/auth/register').send({
      nombre: 'Admin Jest',
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

    // Crear categoría
    const resCat = await request(app)
      .post('/categorias')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Categoria Jest' })

    expect(resCat.statusCode).toBe(200)
    categoriaId = resCat.body.id

    // Crear evento
    const resEvento = await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: nombreEvento,
        descripcion: 'Evento de prueba con Jest',
        fecha: '2030-01-01',
        hora: '18:00',
        ubicacion: 'Ciudad Jest',
        capacidad_total: 100,
        boletos_disponibles: 100,
        categoria_id: categoriaId,
        precio_base: 50,
        localidad_principal: 'General',
      })

    // Tu código ya responde 201 aquí
    expect(resEvento.statusCode).toBe(201)
    eventoId = resEvento.body.id
  })

  afterAll(async () => {
    // Limpieza de datos de prueba
    await pool.query('DELETE FROM boletos WHERE evento_id = $1', [eventoId])
    await pool.query('DELETE FROM localidades_evento WHERE evento_id = $1', [eventoId])
    await pool.query('DELETE FROM eventos WHERE id = $1', [eventoId])
    await pool.query('DELETE FROM categorias WHERE id = $1', [categoriaId])
    await pool.query('DELETE FROM usuarios WHERE email = $1', [adminEmail])
  })

  test('Listar eventos → retorna items', async () => {
    const res = await request(app).get('/events')

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('items')
    expect(Array.isArray(res.body.items)).toBe(true)
  })

  test('Filtrar eventos por search → incluye el evento creado', async () => {
    const res = await request(app).get('/events').query({
      search: 'Jest Integración',
    })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('items')

    const nombres = res.body.items.map((e) => e.nombre)
    expect(nombres).toContain(nombreEvento)
  })
})
