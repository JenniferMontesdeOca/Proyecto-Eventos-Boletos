// backend/tests/unit/roles.test.js
import { jest } from '@jest/globals'
import { requireRole } from '../../middleware/roles.js'

function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }
}

describe('Middleware requireRole', () => {
  test('retorna 401 si no hay usuario en req', () => {
    const req = {}
    const res = createMockRes()
    const next = jest.fn()

    const mw = requireRole([2, 3])
    mw(req, res, next)

    expect(res.statusCode).toBe(401)
    expect(res.body).toEqual({ error: 'No autenticado' })
    expect(next).not.toHaveBeenCalled()
  })

  test('retorna 403 si el rol no está permitido', () => {
    const req = { user: { rol_id: 1 } } // rol user
    const res = createMockRes()
    const next = jest.fn()

    const mw = requireRole([3]) // solo admin
    mw(req, res, next)

    expect(res.statusCode).toBe(403)
    expect(res.body).toEqual({ error: 'No autorizado' })
    expect(next).not.toHaveBeenCalled()
  })

  test('llama next() si el rol está permitido', () => {
    const req = { user: { rol_id: 3 } } // admin
    const res = createMockRes()
    const next = jest.fn()

    const mw = requireRole([2, 3])
    mw(req, res, next)

    expect(res.statusCode).toBe(200)
    expect(next).toHaveBeenCalled()
  })
})
