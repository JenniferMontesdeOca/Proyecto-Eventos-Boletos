// backend/middleware/auth.js
import jwt from 'jsonwebtoken';

export default function auth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticación requerido' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const secret = process.env.JWT_SECRET || 'supersecreto';

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        console.error('Error verificando token', err);
        return res.status(401).json({ error: 'Token inválido o expirado' });
      }

      // aquí guardamos los datos del usuario (id, rol, etc.)
      req.user = decoded;
      next();
    });
  } catch (err) {
    console.error('Auth middleware error', err);
    res.status(500).json({ error: 'Error de autenticación' });
  }
}
