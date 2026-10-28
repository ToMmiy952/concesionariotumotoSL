import { pool } from '../config/db.js';

export const metricasRepository = {
  // Ventas de motos de un vendedor, con filtro opcional por rango de fechas
  async ventasDeMotosDeVendedor(idVendedor, { desde, hasta }) {
    const params = [idVendedor];
    let filtro = '';
    if (desde) {
      params.push(desde);
      filtro += ` AND v.fecha >= $${params.length}::date`;
    }
    if (hasta) {
      params.push(hasta);
      filtro += ` AND v.fecha < ($${params.length}::date + 1)`;
    }

    const result = await pool.query(
      `SELECT v.id_venta, v.fecha, v.monto_total, p.marca || ' ' || m.modelo AS producto
       FROM ventas v
       INNER JOIN detalle_venta d ON d.id_venta = v.id_venta
       INNER JOIN productos p ON d.id_producto = p.id_producto
       INNER JOIN motos m ON m.id_producto = p.id_producto
       WHERE v.tipo_venta = 'Moto' AND v.id_vendedor = $1${filtro}
       ORDER BY v.fecha DESC, v.id_venta DESC`,
      params
    );
    return result.rows;
  },

  // Ventas agrupadas por semana o mes. `unidad` ('week' | 'month') y `ventana` (intervalo hacia atrás) los decide el service
  async ventasPorPeriodo(unidad, ventana) {
    const result = await pool.query(
      `SELECT date_trunc($1, fecha)::date AS periodo,
              COUNT(*)::int AS cantidad_ventas,
              SUM(monto_total) AS monto_total
       FROM ventas
       WHERE fecha >= date_trunc($1, now()) - $2::interval
       GROUP BY 1
       ORDER BY 1`,
      [unidad, ventana]
    );
    return result.rows;
  },

  async accesoriosMasVendidos(limite) {
    const result = await pool.query(
      `SELECT a.id_producto, a.nombre,
              SUM(d.cantidad)::int AS unidades_vendidas,
              SUM(d.cantidad * d.precio_unitario_historico) AS monto_total
       FROM detalle_venta d
       INNER JOIN accesorios a ON d.id_producto = a.id_producto
       GROUP BY a.id_producto, a.nombre
       ORDER BY unidades_vendidas DESC, a.id_producto
       LIMIT $1`,
      [limite]
    );
    return result.rows;
  },

  async motosMasVendidas(limite) {
    const result = await pool.query(
      `SELECT m.id_producto, p.marca || ' ' || m.modelo AS moto,
              SUM(d.cantidad)::int AS unidades_vendidas,
              SUM(d.cantidad * d.precio_unitario_historico) AS monto_total
       FROM detalle_venta d
       INNER JOIN motos m ON d.id_producto = m.id_producto
       INNER JOIN productos p ON p.id_producto = m.id_producto
       GROUP BY m.id_producto, p.marca, m.modelo
       ORDER BY unidades_vendidas DESC, m.id_producto
       LIMIT $1`,
      [limite]
    );
    return result.rows;
  },

  // Todos los vendedores (aunque no tengan ventas) con sus ventas de motos
  async desempenoVendedores() {
    const result = await pool.query(
      `SELECT u.id_usuario, u.nombre,
              COUNT(v.id_venta)::int AS cantidad_ventas,
              COALESCE(SUM(v.monto_total), 0) AS monto_total
       FROM vendedores ve
       INNER JOIN usuarios u ON u.id_usuario = ve.id_usuario
       LEFT JOIN ventas v ON v.id_vendedor = ve.id_usuario AND v.tipo_venta = 'Moto'
       GROUP BY u.id_usuario, u.nombre
       ORDER BY monto_total DESC, u.id_usuario`
    );
    return result.rows;
  },
};
