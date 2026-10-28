import { PORCENTAJE_COMISION } from '../config/negocio.js';
import { metricasRepository } from '../repositories/metricas.repository.js';

const redondear = (n) => Math.round(n * 100) / 100;
const comisionDe = (monto) => redondear((Number(monto) * PORCENTAJE_COMISION) / 100);

// Ventana de cada período: semanal = últimas 8 semanas, mensual = últimos 12 meses
const PERIODOS = {
  semanal: { unidad: 'week', ventana: '7 weeks' },
  mensual: { unidad: 'month', ventana: '11 months' },
};

export const PERIODOS_VALIDOS = Object.keys(PERIODOS);

export const metricasService = {
  // La comisión no se guarda en la base: se calcula acá a partir del monto de cada venta
  async deVendedor(idVendedor, rango) {
    const ventas = (await metricasRepository.ventasDeMotosDeVendedor(idVendedor, rango)).map((v) => ({
      ...v,
      monto_total: Number(v.monto_total),
      comision: comisionDe(v.monto_total),
    }));

    return {
      porcentaje_comision: PORCENTAJE_COMISION,
      cantidad_ventas: ventas.length,
      comision_total: redondear(ventas.reduce((acc, v) => acc + v.comision, 0)),
      ventas,
    };
  },

  async deAdmin(periodo) {
    const { unidad, ventana } = PERIODOS[periodo];
    const [porPeriodo, accesorios, motos, vendedores] = await Promise.all([
      metricasRepository.ventasPorPeriodo(unidad, ventana),
      metricasRepository.accesoriosMasVendidos(5),
      metricasRepository.motosMasVendidas(5),
      metricasRepository.desempenoVendedores(),
    ]);

    const conMontoNumerico = (fila) => ({ ...fila, monto_total: Number(fila.monto_total) });

    return {
      periodo,
      ventas_por_periodo: porPeriodo.map(conMontoNumerico),
      accesorios_mas_vendidos: accesorios.map(conMontoNumerico),
      motos_mas_vendidas: motos.map(conMontoNumerico),
      desempeno_vendedores: vendedores.map((v) => ({
        ...conMontoNumerico(v),
        comision_total: comisionDe(v.monto_total),
      })),
    };
  },
};
