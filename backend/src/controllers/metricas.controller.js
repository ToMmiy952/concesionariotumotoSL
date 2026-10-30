import { pool } from '../config/db.js';
import { PORCENTAJE_COMISION } from '../config/negocio.js';
import { fechaValida } from '../middlewares/validaciones.js';

const redondear = (n) => Math.round(n * 100) / 100;
// La comisión no se guarda en la base: se calcula a partir del monto de cada venta
const comisionDe = (monto) => redondear((Number(monto) * PORCENTAJE_COMISION) / 100);

// Ventana de cada período: semanal = últimas 8 semanas, mensual = últimos 12 meses
const PERIODOS = {
  semanal: { unidad: 'week', ventana: '7 weeks' },
  mensual: { unidad: 'month', ventana: '11 months' },
};

export const metricasController = {
  // GET /api/v1/metricas/vendedor (vendedor: sus ventas de motos y comisiones; filtro ?desde= ?hasta=)
  async deVendedor(req, res) {
    const { desde, hasta } = req.query;
    if ((desde && !fechaValida(desde)) || (hasta && !fechaValida(hasta))) {
      return res.status(400).json({ error: 'Las fechas deben tener formato YYYY-MM-DD' });
    }

    const params = [req.usuario.id_usuario];
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

    const ventas = result.rows.map((v) => ({
      ...v,
      monto_total: Number(v.monto_total),
      comision: comisionDe(v.monto_total),
    }));

    res.json({
      porcentaje_comision: PORCENTAJE_COMISION,
      cantidad_ventas: ventas.length,
      comision_total: redondear(ventas.reduce((acc, v) => acc + v.comision, 0)),
      ventas,
    });
  },

  // GET /api/v1/metricas/admin (admin: reportes; ?periodo=semanal|mensual)
  async deAdmin(req, res) {
    const periodo = req.query.periodo ?? 'mensual';
    if (!PERIODOS[periodo]) {
      return res.status(400).json({ error: `El período debe ser: ${Object.keys(PERIODOS).join(' o ')}` });
    }
    const { unidad, ventana } = PERIODOS[periodo];

    const [porPeriodo, accesorios, motos, vendedores] = await Promise.all([
      // ventas agrupadas por semana o mes
      pool.query(
        `SELECT date_trunc($1, fecha)::date AS periodo,
                COUNT(*)::int AS cantidad_ventas,
                SUM(monto_total) AS monto_total
         FROM ventas
         WHERE fecha >= date_trunc($1, now()) - $2::interval
         GROUP BY 1
         ORDER BY 1`,
        [unidad, ventana]
      ),
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
      periodo,
      ventas_por_periodo: porPeriodo.rows.map(conMontoNumerico),
      accesorios_mas_vendidos: accesorios.rows.map(conMontoNumerico),
      motos_mas_vendidas: motos.rows.map(conMontoNumerico),
      desempeno_vendedores: vendedores.rows.map((v) => ({
        ...conMontoNumerico(v),
        comision_total: comisionDe(v.monto_total),
      })),
    });
  },
};
