// backend/tests/unit/precios.service.test.js
import { calcularTotal, desglosarTotal } from '../../services/precios.service.js'

describe('Servicio de precios (domain logic)', () => {
  test('calcularTotal: multiplica precio * cantidad', () => {
    const total = calcularTotal(100, 3, 0)
    expect(total).toBe(300)
  })

  test('calcularTotal: incluye fee fijo', () => {
    const total = calcularTotal(50, 2, 10)
    expect(total).toBe(110) // 50*2 + 10
  })

  test('calcularTotal: lanza error si cantidad negativa', () => {
    expect(() => calcularTotal(100, -1, 0)).toThrow('Cantidad negativa')
  })

  test('desglosarTotal: devuelve subtotal, fee y total correctos', () => {
    const { subtotal, fee, total } = desglosarTotal(80, 2, 20)
    expect(subtotal).toBe(160)
    expect(fee).toBe(20)
    expect(total).toBe(180)
  })
})
