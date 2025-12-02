// backend/services/precios.service.js

/**
 * Calcula el total a pagar por boletos.
 * @param {number} precioUnitario - precio por boleto
 * @param {number} cantidad - cantidad de boletos
 * @param {number} feeFijo - cargo fijo adicional
 * @returns {number} total
 */
export function calcularTotal(precioUnitario, cantidad = 1, feeFijo = 0) {
  const qty = Number(cantidad) || 0
  if (qty < 0) {
    throw new Error('Cantidad negativa no permitida')
  }

  const p = Number(precioUnitario) || 0
  const fee = Number(feeFijo) || 0

  return p * qty + fee
}

/**
 * Devuelve un desglose {subtotal, fee, total}
 */
export function desglosarTotal(precioUnitario, cantidad = 1, feeFijo = 0) {
  const p = Number(precioUnitario) || 0
  const qty = Number(cantidad) || 0
  const fee = Number(feeFijo) || 0

  const subtotal = p * qty
  const total = subtotal + fee

  return { subtotal, fee, total }
}
