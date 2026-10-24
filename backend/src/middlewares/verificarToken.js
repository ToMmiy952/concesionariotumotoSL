import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization; // "Bearer eyJhbGciOi..."

  // Validar que la cabecera comience con "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. Falta el token de autenticación' });
  }

  // Extraer únicamente la cadena del token
  const token = authHeader.split(' ')[1];

  try {
    //  Verificar la firma y el vencimiento
    const payload = jwt.verify(token, env.JWT_SECRET);

    //  Inyectar la información del usuario verificado en req.usuario
    req.usuario = {
      id_usuario: payload.id_usuario,
      email: payload.email,
      rol: payload.rol
    };

    next(); // Token válido: continúa hacia el controller objetivo
  } catch (err) {
    const mensaje = err.name === 'TokenExpiredError' 
      ? 'El token ha expirado. Por favor, inicie sesión nuevamente' 
      : 'Token de autenticación inválido';
      
    return res.status(401).json({ error: mensaje });
  }
};