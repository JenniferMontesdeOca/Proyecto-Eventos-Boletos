// backend/middleware/roles.js
export function requireRole(rolesPermitidos = []) {
  return (req, res, next) => {
    // primero verificar que venga el usuario desde auth.js
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    // MUY IMPORTANTE: usar el mismo campo que ponemos en el token
    const rolUsuario = req.user.rol_id   // <-- aquí

    // si el rol del usuario no está en la lista permitida
    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    // todo bien
    next()
  }
}
