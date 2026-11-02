import { pool } from '../config/db.js';
import { PORCENTAJE_COMISION } from '../config/negocio.js';

const redondear = (n) => Math.round(n * 100) / 100;
// La comisión no se guarda en la base: se calcula a partir del monto de cada venta
const comisionDe = (monto) => redondear((Number(monto) * PORCENTAJE_COMISION) / 100);

// Ventas agrupadas por semana o por mes dentro de una ventana hacia atrás
const ventasPorPeriodo = (unidad, ventana) =>
  pool.query(
    `SELECT date_trunc($1, fecha)::date AS periodo,
            COUNT(*)::int AS cantidad_ventas,
            SUM(monto_total) AS monto_total
     FROM ventas
     WHERE fecha >= date_trunc($1, now()) - $2::interval
     GROUP BY 1
     ORDER BY 1`,
    [unidad, ventana]
  );

export const metricasController = {
  // GET /api/v1/metricas/admin (admin: reportes de ventas)
  async deAdmin(req, res) {
    const [semanales, mensuales, accesorios, motos, vendedores] = await Promise.all([
      ventasPorPeriodo('week', '7 weeks'), // últimas 8 semanas
      ventasPorPeriodo('month', '11 months'), // últimos 12 meses
      // 5 accesorios más vendidos
      pool.query(
        `SELECT a.id_producto, a.nombre,
                SUM(d.cantidad)::int AS unidades_vendidas,
                SUM(d.cantidad * d.precio_unitario_historico) AS monto_total
         FROM detalle_venta d
         INNER JOIN accesorios a ON d.id_producto = a.id_producto
         GROUP BY a.id_producto, a.nombre
         ORDER BY unidades_vendidas DESC, a.id_producto
         LIMIT 5`
      ),
      // 5 motos más vendidas
      pool.query(
        `SELECT m.id_producto, p.marca || ' ' || m.modelo AS moto,
                SUM(d.cantidad)::int AS unidades_vendidas,
                SUM(d.cantidad * d.precio_unitario_historico) AS monto_total
         FROM detalle_venta d
         INNER JOIN motos m ON d.id_producto = m.id_producto
         INNER JOIN productos p ON p.id_producto = m.id_producto
         GROUP BY m.id_producto, p.marca, m.modelo
         ORDER BY unidades_vendidas DESC, m.id_producto
         LIMIT 5`
      ),
      // todos los vendedores (aunque no tengan ventas) con sus ventas de motos
      pool.query(
        `SELECT u.id_usuario, u.nombre,
                COUNT(v.id_venta)::int AS cantidad_ventas,
                COALESCE(SUM(v.monto_total), 0) AS monto_total
         FROM vendedores ve
         INNER JOIN usuarios u ON u.id_usuario = ve.id_usuario
         LEFT JOIN ventas v ON v.id_vendedor = ve.id_usuario AND v.tipo_venta = 'Moto'
         GROUP BY u.id_usuario, u.nombre
         ORDER BY monto_total DESC, u.id_usuario`
      ),
    ]);

    const conMontoNumerico = (fila) => ({ ...fila, monto_total: Number(fila.monto_total) });

    res.json({
      ventas_semanales: semanales.rows.map(conMontoNumerico),
      ventas_mensuales: mensuales.rows.map(conMontoNumerico),
      accesorios_mas_vendidos: accesorios.rows.map(conMontoNumerico),
      motos_mas_vendidas: motos.rows.map(conMontoNumerico),
      desempeno_vendedores: vendedores.rows.map((v) => ({
        ...conMontoNumerico(v),
        comision_total: comisionDe(v.monto_total),
      })),
    });
  },
};
