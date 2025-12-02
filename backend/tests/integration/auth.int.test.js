// backend/tests/integration/auth.int.test.js
import request from 'supertest'
import app from '../../testApp.js'
import pool from '../../db.js'

describe('Auth integration (register & login)', () => {
  const testEmail = `jest_user_${Date.now()}@example.com`
  const testPassword = '123456'
  let createdUserId

  afterAll(async () => {
    // limpiamos el usuario de prueba
    await pool.query('DELETE FROM usuarios WHERE email = $1', [testEmail])
  })

  test('register → 200 y usuario creado en DB', async () => {
    const res = await request(app).post('/auth/register').send({
      nombre: 'Usuario Jest',
      email: testEmail,
      password: testPassword,
      rol_id: 1,
    })

    // Tu código actual devuelve 200 (no 201), por eso esperamos 200 aquí.
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('id')
    createdUserId = res.body.id

    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [testEmail]
    )
    expect(rows.length).toBe(1)
    expect(rows[0].email).toBe(testEmail)
  })

  test('login → 200, retorna token y no expone password_hash', async () => {
    const res = await request(app).post('/auth/login').send({
      email: testEmail,
      password: testPassword,
    })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).toHaveProperty('id', createdUserId)
    expect(res.body.user).not.toHaveProperty('password_hash')
  })
})
