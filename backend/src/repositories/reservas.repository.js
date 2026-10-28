import { pool, conTransaccion } from '../config/db.js';

// Marca la moto como Disponible si todavía le quedan unidades sin reservar, o como Reservada si no
export async function sincronizarEstadoMoto(db, idMoto) {
  const vigentes = await db.query(
    `SELECT COUNT(*) FROM reservas
     WHERE id_moto = $1 AND estado_reserva = 'vigente' AND fecha_vencimiento > NOW()`,
    [idMoto]
  );
  const stock = await db.query('SELECT stock FROM productos WHERE id_producto = $1', [idMoto]);

  const hayCupo = parseInt(vigentes.rows[0].count, 10) < stock.rows[0].stock;
  await db.query('UPDATE motos SET estado = $1 WHERE id_producto = $2', [hayCupo ? 'Disponible' : 'Reservada', idMoto]);
}

export const reservasRepository = {
  // Resultado: { resultado: 'ok', reserva } | { resultado: 'moto_inexistente' } | { resultado: 'sin_unidades' }
  async crear({ idMoto, nombre_interesado, email_interesado, telefono_interesado, horario_preferido, comentarios }) {
    return conTransaccion(async (db) => {
      // FOR UPDATE bloquea la moto para que dos reservas simultáneas no se pasen del stock
      const moto = await db.query(
        `SELECT p.stock
         FROM motos m
         INNER JOIN productos p ON m.id_producto = p.id_producto
         WHERE m.id_producto = $1 AND p.esta_activo = true
         FOR UPDATE`,
        [idMoto]
      );
      if (moto.rows.length === 0) return { resultado: 'moto_inexistente' };

      const vigentes = await db.query(
        `SELECT COUNT(*) FROM reservas
         WHERE id_moto = $1 AND estado_reserva = 'vigente' AND fecha_vencimiento > NOW()`,
        [idMoto]
      );
      if (parseInt(vigentes.rows[0].count, 10) >= moto.rows[0].stock) return { resultado: 'sin_unidades' };

      const reserva = await db.query(
        `INSERT INTO reservas (id_moto, nombre_interesado, email_interesado, telefono_interesado,
                               fecha_vencimiento, horario_preferido, comentarios, estado_reserva)
         VALUES ($1, $2, $3, $4, NOW() + INTERVAL '48 hours', $5, $6, 'vigente')
         RETURNING id_reserva, fecha_reserva, fecha_vencimiento, estado_reserva`,
        [idMoto, nombre_interesado, email_interesado, telefono_interesado, horario_preferido || null, comentarios || null]
      );

      await sincronizarEstadoMoto(db, idMoto);
      return { resultado: 'ok', reserva: reserva.rows[0] };
    });
  },

  async listar({ estado }) {
    const params = [];
    let query = `
      SELECT r.id_reserva, r.id_moto, p.marca, m.modelo,
             r.nombre_interesado, r.email_interesado, r.telefono_interesado,
             r.fecha_reserva, r.fecha_vencimiento, r.estado_reserva,
             r.horario_preferido, r.comentarios
      FROM reservas r
      INNER JOIN motos m ON r.id_moto = m.id_producto
      INNER JOIN productos p ON m.id_producto = p.id_producto`;

    if (estado) {
      params.push(estado);
      query += ' WHERE r.estado_reserva = $1';
    }

    const result = await pool.query(`${query} ORDER BY r.fecha_reserva DESC`, params);
    return result.rows;
  },

  // Devuelve false si la reserva no existe
  async cambiarEstado(id, estado) {
    return conTransaccion(async (db) => {
      const result = await db.query(
        'UPDATE reservas SET estado_reserva = $1 WHERE id_reserva = $2 RETURNING id_moto',
        [estado, id]
      );
      if (result.rowCount === 0) return false;

      await sincronizarEstadoMoto(db, result.rows[0].id_moto);
      return true;
    });
  },
};
