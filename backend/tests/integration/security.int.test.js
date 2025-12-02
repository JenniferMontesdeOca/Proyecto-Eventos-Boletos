// backend/tests/integration/security.int.test.js
import request from 'supertest'
import app from '../../testApp.js'
import pool from '../../db.js'

describe('Seguridad y roles', () => {
  const userEmail = `jest_user_security_${Date.now()}@example.com`
  const adminEmail = `jest_admin_security_${Date.now()}@example.com`
  const password = '123456'
  let userToken
  let adminToken

  beforeAll(async () => {
    // Crear user (rol 1)
    await request(app).post('/auth/register').send({
      nombre: 'User Security Jest',
      email: userEmail,
      password,
      rol_id: 1,
    })

    const resUserLogin = await request(app).post('/auth/login').send({
      email: userEmail,
      password,
    })

    expect(resUserLogin.statusCode).toBe(200)
    userToken = resUserLogin.body.token

    // Crear admin (rol 3)
    await request(app).post('/auth/register').send({
      nombre: 'Admin Security Jest',
      email: adminEmail,
      password,
      rol_id: 3,
    })

    const resAdminLogin = await request(app).post('/auth/login').send({
      email: adminEmail,
      password,
    })

    expect(resAdminLogin.statusCode).toBe(200)
    adminToken = resAdminLogin.body.token
  })

  afterAll(async () => {
    await pool.query('DELETE FROM usuarios WHERE email IN ($1, $2)', [
      userEmail,
      adminEmail,
    ])
  })

  test('Endpoint protegido sin token → 401', async () => {
    // /boletos/mios requiere auth
    const res = await request(app).get('/boletos/mios')

    expect(res.statusCode).toBe(401)
    expect(res.body).toHaveProperty('error')
  })

  test('Rol no permitido → 403 (user intentando crear categoría)', async () => {
    const res = await request(app)
      .post('/categorias')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ nombre: 'Categoria no permitida' })

    expect(res.statusCode).toBe(403)
    expect(res.body).toHaveProperty('error', 'No autorizado')
  })

  test('Rol permitido → puede crear categoría (admin rol 3)', async () => {
    const res = await request(app)
      .post('/categorias')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Categoria permitida' })

    // Limpieza inmediata
    if (res.body && res.body.id) {
      await pool.query('DELETE FROM categorias WHERE id = $1', [res.body.id])
    }

    expect(res.statusCode).toBe(200)
  })
})
