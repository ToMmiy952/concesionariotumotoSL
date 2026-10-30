import { pool, conTransaccion } from '../config/db.js';
import { enteroPositivo, fechaValida } from '../middlewares/validaciones.js';
import { sincronizarEstadoMoto } from './reservas.controller.js';

const redondear = (n) => Math.round(n * 100) / 100;

// Una venta con su detalle (renglones), o null si no existe
async function buscarVentaConDetalle(id) {
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
     LEFT JOIN motos m ON m.id_producto = p.id_producto
     LEFT JOIN accesorios a ON a.id_producto = p.id_producto
     WHERE d.id_venta = $1
     ORDER BY d.id_detalle_venta`,
    [id]
  );
  return { ...venta.rows[0], detalle: detalle.rows };
}

export const ventasController = {
  // POST /api/v1/ventas/online (cliente: paga su carrito)
  async crearOnline(req, res) {
    const idCliente = req.usuario.id_usuario;

    // Todo en una transacción: crea la venta con su detalle (precio histórico), descuenta stock y vacía el carrito
    const { resultado, idVenta, producto } = await conTransaccion(async (db) => {
      // FOR UPDATE bloquea los productos para que dos compras simultáneas no se pasen del stock
      const items = await db.query(
        `SELECT ic.id_accesorio, ic.cantidad, p.precio, p.stock, p.esta_activo, a.nombre
         FROM item_carrito ic
         INNER JOIN productos p ON ic.id_accesorio = p.id_producto
         INNER JOIN accesorios a ON a.id_producto = p.id_producto
         INNER JOIN carritos c ON ic.id_carrito = c.id_carrito
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
      const id = venta.rows[0].id_venta;

      for (const item of items.rows) {
        await db.query(
          `INSERT INTO detalle_venta (id_venta, id_producto, precio_unitario_historico, cantidad)
           VALUES ($1, $2, $3, $4)`,
          [id, item.id_accesorio, item.precio, item.cantidad]
        );
        await db.query('UPDATE productos SET stock = stock - $1 WHERE id_producto = $2', [item.cantidad, item.id_accesorio]);
      }

      await db.query(
        'DELETE FROM item_carrito WHERE id_carrito = (SELECT id_carrito FROM carritos WHERE id_cliente = $1)',
        [idCliente]
      );
      return { resultado: 'ok', idVenta: id };
    });

    if (resultado === 'carrito_vacio') {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }
    if (resultado === 'sin_stock') {
      return res.status(400).json({ error: `No hay stock suficiente de "${producto}"` });
    }
    res.status(201).json(await buscarVentaConDetalle(idVenta));
  },

  // POST /api/v1/ventas/motos (vendedor: venta presencial de una moto, opcionalmente desde una reserva)
  async crearMoto(req, res) {
    const { idMoto, idReserva } = req.body;

    if (!enteroPositivo(idMoto) || (idReserva != null && !enteroPositivo(idReserva))) {
      return res.status(400).json({ error: 'idMoto (y idReserva, si se envía) deben ser enteros positivos' });
    }

    const idVendedor = req.usuario.id_usuario;
    const moto = Number(idMoto);
    const reserva = idReserva == null ? null : Number(idReserva);

    // Todo en una transacción: concreta la reserva (si viene), crea la venta, descuenta stock y sincroniza el estado
    const { resultado, idVenta } = await conTransaccion(async (db) => {
      const datosMoto = await db.query(
        `SELECT p.precio, p.stock
         FROM productos p
         INNER JOIN motos m ON m.id_producto = p.id_producto
         WHERE p.id_producto = $1 AND p.esta_activo = true
         FOR UPDATE OF p`,
        [moto]
      );
      if (datosMoto.rows.length === 0) return { resultado: 'moto_inexistente' };
      if (datosMoto.rows[0].stock < 1) return { resultado: 'sin_stock' };

      if (reserva) {
        const datosReserva = await db.query(
          'SELECT id_moto, estado_reserva, fecha_vencimiento > NOW() AS en_plazo FROM reservas WHERE id_reserva = $1 FOR UPDATE',
          [reserva]
        );
        if (datosReserva.rows.length === 0) return { resultado: 'reserva_inexistente' };
        if (datosReserva.rows[0].id_moto !== moto) return { resultado: 'reserva_ajena' };
        if (datosReserva.rows[0].estado_reserva !== 'vigente' || !datosReserva.rows[0].en_plazo) {
          return { resultado: 'reserva_no_vigente' };
        }

        await db.query(`UPDATE reservas SET estado_reserva = 'concretada' WHERE id_reserva = $1`, [reserva]);
      }

      const { precio } = datosMoto.rows[0];
      const venta = await db.query(
        `INSERT INTO ventas (monto_total, tipo_venta, id_vendedor) VALUES ($1, 'Moto', $2) RETURNING id_venta`,
        [precio, idVendedor]
      );
      const id = venta.rows[0].id_venta;

      await db.query(
        `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario_historico) VALUES ($1, $2, 1, $3)`,
        [id, moto, precio]
      );
      await db.query('UPDATE productos SET stock = stock - 1 WHERE id_producto = $1', [moto]);
      await sincronizarEstadoMoto(db, moto);

      return { resultado: 'ok', idVenta: id };
    });

    const errores = {
      reserva_inexistente: [404, 'La reserva no existe'],
      moto_inexistente: [404, 'La moto no existe o está inactiva'],
      reserva_no_vigente: [400, 'La reserva no está vigente'],
      sin_stock: [400, 'La moto no tiene stock disponible'],
      reserva_ajena: [400, 'La reserva corresponde a otra moto'],
    };
    if (errores[resultado]) {
      const [estado, error] = errores[resultado];
      return res.status(estado).json({ error });
    }

    res.status(201).json(await buscarVentaConDetalle(idVenta));
  },

  // GET /api/v1/ventas (cliente: las suyas, vendedor: las suyas, admin: todas; filtro ?desde= ?hasta=)
  async listar(req, res) {
    const { desde, hasta } = req.query;
    if ((desde && !fechaValida(desde)) || (hasta && !fechaValida(hasta))) {
      return res.status(400).json({ error: 'Las fechas deben tener formato YYYY-MM-DD' });
    }

    const { rol, id_usuario } = req.usuario;
    const params = [];
    const where = [];

    // El alcance depende del rol: el admin no tiene filtro de propietario
    if (rol === 'CLIENTE') {
      params.push(id_usuario);
      where.push(`v.id_cliente = $${params.length}`);
    } else if (rol === 'VENDEDOR') {
      params.push(id_usuario);
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
    res.json(result.rows);
  },

  // GET /api/v1/ventas/:id
  async obtenerPorId(req, res) {
    const venta = await buscarVentaConDetalle(req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });

    const { rol, id_usuario } = req.usuario;
    const esSuya = venta.id_cliente === id_usuario || venta.id_vendedor === id_usuario;
    if (rol !== 'ADMINISTRADOR' && !esSuya) {
      return res.status(403).json({ error: 'Acceso denegado. No posee los permisos necesarios para esta acción' });
    }
    res.json(venta);
  },
};
