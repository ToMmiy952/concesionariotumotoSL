import { metricasService, PERIODOS_VALIDOS } from '../services/metricas.service.js';
import { fechaValida } from '../utils/validaciones.js';

export const metricasController = {
  // GET /api/v1/metricas/vendedor (vendedor: sus ventas de motos y comisiones; filtro ?desde= ?hasta=)
  async deVendedor(req, res) {
    const { desde, hasta } = req.query;
    if ((desde && !fechaValida(desde)) || (hasta && !fechaValida(hasta))) {
      return res.status(400).json({ error: 'Las fechas deben tener formato YYYY-MM-DD' });
    }
    res.json(await metricasService.deVendedor(req.usuario.id_usuario, { desde, hasta }));
  },

  // GET /api/v1/metricas/admin (admin: reportes; ?periodo=semanal|mensual)
  async deAdmin(req, res) {
    const periodo = req.query.periodo ?? 'mensual';
    if (!PERIODOS_VALIDOS.includes(periodo)) {
      return res.status(400).json({ error: `El período debe ser: ${PERIODOS_VALIDOS.join(' o ')}` });
    }
    res.json(await metricasService.deAdmin(periodo));
  },
};
