import { pool } from '../config/db.js';

export const reservasController = {
  // 1. POST /api/v1/reservas (Público - Reserva de cita por 48 hs)
  async crear(req, res, next) {
    const {idMoto, nombre_interesado, email_interesado, telefono_interesado, horario_preferido, comentarios 
    } = req.body;

    if (!idMoto || !nombre_interesado || !email_interesado) {
      return res.status(400).json({ 
        error: 'El ID de la moto, el nombre y el email del interesado son obligatorios' 
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // A. Verificar existencia y estado actual de la moto
      const motoRes = await client.query(
        `SELECT p.id_producto, p.stock, m.estado, p.esta_activo
         FROM motos m
         INNER JOIN productos p ON m.id_producto = p.id_producto
         WHERE m.id_producto = $1 AND p.esta_activo = true FOR UPDATE`,
        [idMoto]
      );

      if (motoRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'La moto solicitada no existe o está inactiva' });
      }

      const moto = motoRes.rows[0];

      //creo que aca esta el problema, porque no estoy considerando las unidades en stock qe tengo, y solo
      //con una reserva activa, no puedo reservar otra moto, aunque tenga 2 en stock. Entonces, si tengo 2 motos en stock y una esta reservada, deberia poder reservar la otra.
      
      //aca cuento cuantas reservas activas hay para esa moto, y si es mayor o igual al stock, no dejo reservar
      const reservasCountRes = await client.query(
        `SELECT COUNT(*) FROM reservas WHERE id_moto =$1
        AND estado_reserva = 'vigente'
        AND fecha_reserva > NOW() - INTERVAL '48 hours'`,
        [idMoto]
      );

      const reservasVigentes= parseInt(reservasCountRes.rows[0].count, 10);

      if (reservasVigentes >= moto.stock) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: 'No hay unidades disponibles para reservar esta moto' });
      }

      // B. Crear el registro de la reserva con fecha_vencimiento a 48 hs
      const reservaRes = await client.query(
        `INSERT INTO reservas (
            id_moto, 
            nombre_interesado, 
            email_interesado, 
            telefono_interesado, 
            fecha_vencimiento, 
            horario_preferido, 
            comentarios,
            estado_reserva
         ) 
         VALUES ($1, $2, $3, $4, NOW() + INTERVAL '48 hours', $5, $6, 'vigente') 
         RETURNING id_reserva, fecha_reserva, fecha_vencimiento, estado_reserva`,
        [
          idMoto, 
          nombre_interesado, 
          email_interesado, 
          telefono_interesado || null, 
          horario_preferido || null, 
          comentarios || null
        ]
      );

    if(reservasVigentes + 1 >= moto.stock) {
        // Si la reserva actual hace que se agoten las unidades, actualizar el estado de la moto a 'Reservada'
        await client.query(
          `UPDATE motos SET estado = 'Reservada' WHERE id_producto = $1`,
          [idMoto]
        );
      }

      await client.query('COMMIT');

      return res.status(201).json({
        mensaje: 'Reserva de cita registrada con éxito por 48 horas',
        reserva: reservaRes.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  },

  // 2. GET /api/v1/reservas (Protegido - Vendedores y Administradores)
  async listar(req, res, next) {
    const { estado } = req.query;

    try {
      let query = `
        SELECT r.id_reserva, r.id_moto, p.marca, m.modelo, 
               r.nombre_interesado, r.email_interesado, r.telefono_interesado,
               r.fecha_reserva, r.fecha_vencimiento, r.estado_reserva, 
               r.horario_preferido, r.comentarios
        FROM reservas r
        INNER JOIN motos m ON r.id_moto = m.id_producto
        INNER JOIN productos p ON m.id_producto = p.id_producto
      `;
      const params = [];

      if (estado) {
        params.push(estado);
        query += ` WHERE r.estado_reserva = $1`;
      }

      query += ` ORDER BY r.fecha_reserva DESC`;

      const result = await pool.query(query, params);
      return res.json(result.rows);
    } catch (error) {
      next(error);
    }
  },

  // 3. PATCH /api/v1/reservas/:id (Protegido - Cambiar estado a Concretada o Cancelada)
  async cambiarEstado(req, res, next) {
    const { id } = req.params;
    const { estado_reserva } = req.body; // 'Concretada' o 'Cancelada/Vencida'

    const nuevoEstado = (estado_reserva || '').trim().toLowerCase();

    if (!['concretada', 'cancelada','vencida', 'vigente'].includes(nuevoEstado)) {
      return res.status(400).json({ error: 'Estado de reserva no válido' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Actualizar reserva
      const resResult = await client.query(
        `UPDATE reservas 
         SET estado_reserva = $1 
         WHERE id_reserva = $2 
         RETURNING id_moto`,
        [estado_reserva, id]
      );

      if (resResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      const idMoto = resResult.rows[0].id_moto;
      //cuento de nuevo als reservas vigentes para la moto
      const reservasCountRes = await client.query(
      `SELECT COUNT(*) FROM reservas 
       WHERE id_moto = $1 
         AND estado_reserva = 'vigente' 
         AND fecha_reserva >= NOW() - INTERVAL '48 hours'`,
      [idMoto]
    );

    const reservasVigentes = parseInt(reservasCountRes.rows[0].count, 10);

    //obtengo el stock de la moto
    const stockRes = await client.query(
      `SELECT p.stock
       FROM productos p
       INNER JOIN motos m ON m.id_producto = p.id_producto
       WHERE m.id_producto = $1`,
      [idMoto]
    );
    const stockTotal = stockRes.rows[0].stock;

    //si hay algun cupo libre, pongo la moto como disponible(o la mantengo en caso que este)
    if (reservasVigentes < stockTotal) {
      await client.query(
        `UPDATE motos SET estado = 'Disponible' WHERE id_producto = $1`,
        [idMoto]
      );
    }
         

      await client.query('COMMIT');
      return res.json({ mensaje: `Reserva actualizada a estado ${nuevoEstado}` });

    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  }
};