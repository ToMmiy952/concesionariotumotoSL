import { pool, conTransaccion } from '../config/db.js';
import { enteroPositivo } from '../middlewares/validaciones.js';
import { sincronizarEstadoMoto } from './reservas.controller.js';

const redondear = (n) => Math.round(n * 100) / 100;

// Valores que manda el front -> valor que se guarda en la base
const METODOS_PAGO = { credito: 'Credito', debito: 'Debito', mercadopago: 'Mercado Pago' };
const TIPOS_ENTREGA = { domicilio: 'Domicilio', retiro: 'Retiro' };
const LARGO_MAX_DIRECCION = 150;

// Una venta con su detalle (renglones), o null si no existe
async function buscarVentaConDetalle(id) {
  const venta = await pool.query(
    `SELECT id_venta, fecha, monto_total, tipo_venta, id_cliente, id_vendedor,
            metodo_pago, tipo_entrega, direccion_entrega
     FROM ventas WHERE id_venta = $1`,
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
  // Body: { metodoPago: 'credito' | 'debito' | 'mercadopago', tipoEntrega: 'domicilio' | 'retiro', direccion (solo si es domicilio) }
  // Los datos de la tarjeta NO se reciben ni se guardan: el pago es una simulación
  async crearOnline(req, res) {
    const idCliente = req.usuario.id_usuario;
    const { metodoPago, tipoEntrega, direccion } = req.body ?? {};

    if (!Object.hasOwn(METODOS_PAGO, metodoPago)) {
      return res.status(400).json({ error: 'metodoPago debe ser credito, debito o mercadopago' });
    }
    if (!Object.hasOwn(TIPOS_ENTREGA, tipoEntrega)) {
      return res.status(400).json({ error: 'tipoEntrega debe ser domicilio o retiro' });
    }
    const aDomicilio = tipoEntrega === 'domicilio';
    const direccionLimpia = typeof direccion === 'string' ? direccion.trim() : '';
    if (aDomicilio && !direccionLimpia) {
      return res.status(400).json({ error: 'La dirección de entrega es obligatoria para el envío a domicilio' });
    }
    if (direccionLimpia.length > LARGO_MAX_DIRECCION) {
      return res.status(400).json({ error: `La dirección no puede superar los ${LARGO_MAX_DIRECCION} caracteres` });
    }
    const metodo = METODOS_PAGO[metodoPago];
    const entrega = TIPOS_ENTREGA[tipoEntrega];
    const direccionGuardada = aDomicilio ? direccionLimpia : null; // en un retiro no hay dirección

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
        `INSERT INTO ventas (monto_total, tipo_venta, id_cliente, metodo_pago, tipo_entrega, direccion_entrega)
         VALUES ($1, 'Accesorio Online', $2, $3, $4, $5)
         RETURNING id_venta`,
        [monto, idCliente, metodo, entrega, direccionGuardada]
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

  // POST /api/v1/ventas/accesorios (mostrador: venta presencial de solo accesorios, sin cliente ni vendedor, sin comisión)
  // Body: { items: [{ idAccesorio, cantidad }] }
  async crearAccesoriosPresencial(req, res) {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Debés enviar al menos un accesorio en items' });
    }
    if (!items.every((i) => i && enteroPositivo(i.idAccesorio) && enteroPositivo(i.cantidad))) {
      return res.status(400).json({ error: 'Cada item necesita idAccesorio y cantidad como enteros positivos' });
    }

    // Si el mismo accesorio viene repetido se suman las cantidades
    const pedido = new Map();
    for (const i of items) {
      const id = Number(i.idAccesorio);
      pedido.set(id, (pedido.get(id) ?? 0) + Number(i.cantidad));
    }
    const ids = [...pedido.keys()].sort((a, b) => a - b);

    const { resultado, producto, idVenta } = await conTransaccion(async (db) => {
      // FOR UPDATE bloquea los productos para que dos ventas simultáneas no se pasen del stock
      const filas = await db.query(
        `SELECT p.id_producto, p.precio, p.stock, p.esta_activo, a.nombre
         FROM productos p
         INNER JOIN accesorios a ON a.id_producto = p.id_producto
         WHERE p.id_producto = ANY($1::int[])
         ORDER BY p.id_producto
         FOR UPDATE OF p`,
        [ids]
      );
      if (filas.rows.length !== ids.length) return { resultado: 'accesorio_inexistente' };

      const sinStock = filas.rows.find((f) => !f.esta_activo || pedido.get(f.id_producto) > f.stock);
      if (sinStock) return { resultado: 'sin_stock', producto: sinStock.nombre };

      const monto = redondear(filas.rows.reduce((acc, f) => acc + Number(f.precio) * pedido.get(f.id_producto), 0));
      // tipo 'Accesorio Presencial': id_cliente e id_vendedor quedan en NULL (no genera comisión)
      const venta = await db.query(
        `INSERT INTO ventas (monto_total, tipo_venta) VALUES ($1, 'Accesorio Presencial') RETURNING id_venta`,
        [monto]
      );
      const id = venta.rows[0].id_venta;

      for (const f of filas.rows) {
        const cantidad = pedido.get(f.id_producto);
        await db.query(
          `INSERT INTO detalle_venta (id_venta, id_producto, precio_unitario_historico, cantidad)
           VALUES ($1, $2, $3, $4)`,
          [id, f.id_producto, f.precio, cantidad]
        );
        await db.query('UPDATE productos SET stock = stock - $1 WHERE id_producto = $2', [cantidad, f.id_producto]);
      }
      return { resultado: 'ok', idVenta: id };
    });

    if (resultado === 'accesorio_inexistente') {
      return res.status(404).json({ error: 'Alguno de los accesorios no existe' });
    }
    if (resultado === 'sin_stock') {
      return res.status(400).json({ error: `No hay stock suficiente de "${producto}"` });
    }
    res.status(201).json(await buscarVentaConDetalle(idVenta));
  },

  // GET /api/v1/ventas (cliente: las suyas, vendedor: las suyas, admin: todas; los filtros los hace el front)
  async listar(req, res) {
    const { rol, id_usuario } = req.usuario;
    const params = [];
    let where = '';

    // Esto no es un filtro de la lista sino de permisos: nadie ve las ventas de otro. El admin ve todas
    if (rol === 'CLIENTE') {
      params.push(id_usuario);
      where = 'WHERE v.id_cliente = $1';
    } else if (rol === 'VENDEDOR') {
      params.push(id_usuario);
      where = 'WHERE v.id_vendedor = $1';
    }

    const result = await pool.query(
      `SELECT v.id_venta, v.fecha, v.monto_total, v.tipo_venta, v.id_cliente, v.id_vendedor,
              v.metodo_pago, v.tipo_entrega, v.direccion_entrega
       FROM ventas v
       ${where}
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
