// Manejador centralizado: toda respuesta de error sale como { "error": "mensaje" }
export const manejarErrores = (err, req, res, next) => {
  // Errores del propio Express (por ejemplo, JSON mal formado en el body)
  if (err.status && err.status < 500) {
    const mensaje = err.type === 'entity.parse.failed'
      ? 'El cuerpo de la petición no es un JSON válido'
      : 'Petición inválida';
    return res.status(err.status).json({ error: mensaje });
  }

  // Errores de PostgreSQL que son culpa de los datos enviados, no del servidor
  switch (err.code) {
    case '22P02': // formato inválido (ej: valor fuera del ENUM)
    case '22003': // número fuera de rango
    case '22007': // fecha inválida
    case '22008': // fecha fuera de rango
    case '23502': // NOT NULL
    case '23514': // CHECK
      return res.status(400).json({ error: 'Los datos enviados no son válidos' });
    case '23505': // UNIQUE
      return res.status(409).json({ error: 'El registro ya existe' });
    case '23503': // FOREIGN KEY
      return res.status(409).json({ error: 'La operación entra en conflicto con otros datos' });
  }

  // Cualquier otro error: se registra en el servidor y al cliente no se le expone el detalle
  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
};
