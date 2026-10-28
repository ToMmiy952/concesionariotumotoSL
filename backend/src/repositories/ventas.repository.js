import { pool, conTransaccion } from '../config/db.js';
import { sincronizarEstadoMoto } from './reservas.repository.js';

const redondear = (n) => Math.round(n * 100) / 100;

export const ventasRepository = {
  // Paga el carrito del cliente: crea la venta con su detalle (precio histórico), descuenta stock y vacía el carrito.
  // Resultado: { resultado: 'ok', idVenta } | { resultado: 'carrito_vacio' } | { resultado: 'sin_stock', producto }
  async crearVentaOnline(idCliente) {
    return conTransaccion(async (db) => {
      // FOR UPDATE bloquea los productos para que dos compras simultáneas no se pasen del stock
      const items = await db.query(
        `SELECT ic.id_accesorio, ic.cantidad, p.precio, p.stock, p.esta_activo, a.nombre
         FROM item_carrito ic
         INNER JOIN carritos c ON ic.id_carrito = c.id_carrito
         INNER JOIN productos p ON ic.id_accesorio = p.id_producto
         INNER JOIN accesorios a ON a.id_producto = p.id_producto
         WHERE c.id_cliente = $1
         ORDER BY ic.id_accesorio
         FOR UPDATE OF p`,
        [idCliente]
      );
      if (items.rows.length === 0) return { resultado: 'carrito_vacio' };

      const sinStock = items.rows.find((i) => !i.esta_activo || i.cantidad > i.stock);
      if (sinStock) return { resultado: 'sin_stock', producto: sinStock.nombre };

      const monto = redondear(items.rows.reduce((acc, i) => acc + Number(i.precio) * i.cantidad, 0));
      const venta = await db.query(
        `INSERT INTO ventas (monto_total, tipo_venta, id_cliente) VALUES ($1, 'Accesorio Online', $2)
         RETURNING id_venta`,
        [monto, idCliente]
      );
      const idVenta = venta.rows[0].id_venta;

      for (const item of items.rows) {
        await db.query(
          `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario_historico)
           VALUES ($1, $2, $3, $4)`,
          [idVenta, item.id_accesorio, item.cantidad, item.precio]
        );
        await db.query('UPDATE productos SET stock = stock - $1 WHERE id_producto = $2', [item.cantidad, item.id_accesorio]);
      }

      await db.query(
        'DELETE FROM item_carrito WHERE id_carrito = (SELECT id_carrito FROM carritos WHERE id_cliente = $1)',
        [idCliente]
      );
      return { resultado: 'ok', idVenta };
    });
  },

  // Registra la venta presencial de una moto; si viene de una reserva, la marca como concretada.
  // Resultado: { resultado: 'ok', idVenta } | 'moto_inexistente' | 'sin_stock' | 'reserva_inexistente' | 'reserva_ajena' | 'reserva_no_vigente'
  async crearVentaMoto({ idVendedor, idMoto, idReserva }) {
    return conTransaccion(async (db) => {
      const moto = await db.query(
        `SELECT p.precio, p.stock
         FROM productos p
         INNER JOIN motos m ON m.id_producto = p.id_producto
         WHERE p.id_producto = $1 AND p.esta_activo = true
         FOR UPDATE OF p`,
        [idMoto]
      );
      if (moto.rows.length === 0) return { resultado: 'moto_inexistente' };
      if (moto.rows[0].stock < 1) return { resultado: 'sin_stock' };

      if (idReserva) {
        const reserva = await db.query(
          'SELECT id_moto, estado_reserva FROM reservas WHERE id_reserva = $1 FOR UPDATE',
          [idReserva]
        );
        if (reserva.rows.length === 0) return { resultado: 'reserva_inexistente' };
        if (reserva.rows[0].id_moto !== idMoto) return { resultado: 'reserva_ajena' };
        if (reserva.rows[0].estado_reserva !== 'vigente') return { resultado: 'reserva_no_vigente' };

        await db.query(`UPDATE reservas SET estado_reserva = 'concretada' WHERE id_reserva = $1`, [idReserva]);
      }

      const { precio } = moto.rows[0];
      const venta = await db.query(
        `INSERT INTO ventas (monto_total, tipo_venta, id_vendedor) VALUES ($1, 'Moto', $2) RETURNING id_venta`,
        [precio, idVendedor]
      );
      const idVenta = venta.rows[0].id_venta;

      await db.query(
        `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario_historico) VALUES ($1, $2, 1, $3)`,
        [idVenta, idMoto, precio]
      );
      await db.query('UPDATE productos SET stock = stock - 1 WHERE id_producto = $1', [idMoto]);
      await sincronizarEstadoMoto(db, idMoto);

      return { resultado: 'ok', idVenta };
    });
  },

  // El cliente ve sus compras, el vendedor sus ventas y el admin todas. Filtro opcional por rango de fechas
  async listar({ rol, idUsuario, desde, hasta }) {
    const params = [];
    const where = [];

    if (rol === 'CLIENTE') {
      params.push(idUsuario);
      where.push(`v.id_cliente = $${params.length}`);
    } else if (rol === 'VENDEDOR') {
      params.push(idUsuario);
      where.push(`v.id_vendedor = $${params.length}`);
    }
    if (desde) {
      params.push(desde);
      where.push(`v.fecha >= $${params.length}::date`);
    }
    if (hasta) {
      params.push(hasta);
      where.push(`v.fecha < ($${params.length}::date + 1)`);
    }

    const result = await pool.query(
      `SELECT v.id_venta, v.fecha, v.monto_total, v.tipo_venta, v.id_cliente, v.id_vendedor
       FROM ventas v
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY v.fecha DESC, v.id_venta DESC`,
      params
    );
    return result.rows;
  },

  // Una venta con su detalle (renglones), o null si no existe
  async buscarConDetalle(id) {
    const venta = await pool.query(
      `SELECT id_venta, fecha, monto_total, tipo_venta, id_cliente, id_vendedor FROM ventas WHERE id_venta = $1`,
      [id]
    );
    if (venta.rows.length === 0) return null;

    const detalle = await pool.query(
      `SELECT d.id_detalle_venta, d.id_producto,
              COALESCE(a.nombre, p.marca || ' ' || m.modelo) AS producto,
              d.cantidad, d.precio_unitario_historico,
              (d.cantidad * d.precio_unitario_historico) AS subtotal
       FROM detalle_venta d
       INNER JOIN productos p ON d.id_producto = p.id_producto
       LEFT JOIN accesorios a ON a.id_producto = p.id_producto
       LEFT JOIN motos m ON m.id_producto = p.id_producto
       WHERE d.id_venta = $1
       ORDER BY d.id_detalle_venta`,
      [id]
    );
    return { ...venta.rows[0], detalle: detalle.rows };
  },
};
