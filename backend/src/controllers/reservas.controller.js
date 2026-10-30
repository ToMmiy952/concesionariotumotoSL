import { pool, conTransaccion } from '../config/db.js';
import { emailValido, enteroPositivo } from '../middlewares/validaciones.js';

const ESTADOS_RESERVA = ['vigente', 'concretada', 'vencida', 'cancelada'];

// Marca la moto como Disponible si todavía le quedan unidades sin reservar, o como Reservada si no.
// Se exporta porque el controlador de ventas también la usa al vender una moto.
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

// Pasa a 'vencida' las reservas vigentes que superaron las 48 hs y libera la moto si corresponde
async function expirarVencidas() {
  await conTransaccion(async (db) => {
    const vencidas = await db.query(
      `UPDATE reservas SET estado_reserva = 'vencida'
       WHERE estado_reserva = 'vigente' AND fecha_vencimiento <= NOW()
       RETURNING id_moto`
    );
    for (const idMoto of new Set(vencidas.rows.map((r) => r.id_moto))) {
      await sincronizarEstadoMoto(db, idMoto);
    }
  });
}

export const reservasController = {
  // POST /api/v1/reservas (público: reserva una cita por 48 hs, sin cuenta)
  async crear(req, res) {
    const { idMoto, nombre_interesado, email_interesado, telefono_interesado, horario_preferido, comentarios } = req.body;

    if (!idMoto || !nombre_interesado || !email_interesado || !telefono_interesado) {
      return res.status(400).json({
        error: 'El ID de la moto, el nombre, el email y el teléfono del interesado son obligatorios',
      });
    }
    if (!enteroPositivo(idMoto)) {
      return res.status(400).json({ error: 'El ID de la moto debe ser un número entero positivo' });
    }
    if (!emailValido(email_interesado)) {
      return res.status(400).json({ error: 'El email no tiene un formato válido' });
    }

    const { resultado, reserva } = await conTransaccion(async (db) => {
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

      const nueva = await db.query(
        `INSERT INTO reservas (id_moto, nombre_interesado, email_interesado, telefono_interesado,
                               fecha_vencimiento, horario_preferido, comentarios, estado_reserva)
         VALUES ($1, $2, $3, $4, NOW() + INTERVAL '48 hours', $5, $6, 'vigente')
         RETURNING id_reserva, fecha_reserva, fecha_vencimiento, estado_reserva`,
        [idMoto, nombre_interesado, email_interesado, telefono_interesado, horario_preferido || null, comentarios || null]
      );

      await sincronizarEstadoMoto(db, idMoto);
      return { resultado: 'ok', reserva: nueva.rows[0] };
    });

    if (resultado === 'moto_inexistente') {
      return res.status(404).json({ error: 'La moto solicitada no existe o está inactiva' });
    }
    if (resultado === 'sin_unidades') {
      return res.status(409).json({ error: 'No hay unidades disponibles para reservar esta moto' });
    }

    res.status(201).json({ mensaje: 'Reserva de cita registrada con éxito por 48 horas', reserva });
  },

  // GET /api/v1/reservas (vendedor o admin, filtro ?estado=)
  async listar(req, res) {
    const estado = req.query.estado?.trim().toLowerCase();
    if (estado && !ESTADOS_RESERVA.includes(estado)) {
      return res.status(400).json({ error: 'Estado de reserva no válido' });
    }

    await expirarVencidas();

    // moto_sin_stock marca las reservas vigentes cuya moto se agotó, para que el vendedor contacte al cliente
    const params = [];
    let query = `
      SELECT r.id_reserva, r.id_moto, p.marca, m.modelo,
             r.nombre_interesado, r.email_interesado, r.telefono_interesado,
             r.fecha_reserva, r.fecha_vencimiento, r.estado_reserva,
             r.horario_preferido, r.comentarios,
             (r.estado_reserva = 'vigente' AND p.stock = 0) AS moto_sin_stock
      FROM reservas r
      INNER JOIN motos m ON r.id_moto = m.id_producto
      INNER JOIN productos p ON m.id_producto = p.id_producto`;

    if (estado) {
      params.push(estado);
      query += ' WHERE r.estado_reserva = $1';
    }

    const result = await pool.query(`${query} ORDER BY r.fecha_reserva DESC`, params);
    res.json(result.rows);
  },

  // PATCH /api/v1/reservas/:id (vendedor o admin)
  async cambiarEstado(req, res) {
    const estado = String(req.body.estado_reserva ?? '').trim().toLowerCase();
    if (!ESTADOS_RESERVA.includes(estado)) {
      return res.status(400).json({ error: 'Estado de reserva no válido' });
    }

    const actualizada = await conTransaccion(async (db) => {
      const result = await db.query(
        'UPDATE reservas SET estado_reserva = $1 WHERE id_reserva = $2 RETURNING id_moto',
        [estado, req.params.id]
      );
      if (result.rowCount === 0) return false;

      await sincronizarEstadoMoto(db, result.rows[0].id_moto);
      return true;
    });

    if (!actualizada) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json({ mensaje: `Reserva actualizada a estado ${estado}` });
  },
};
