import { obtenerMotos } from './productosService'
import { obtenerVentas } from '../vendedor/ventasService'
import { obtenerConsultas } from '../vendedor/consultasService'
import { mesActual } from '../../shared/utils/fechas'

export function calcularMetricas() {
  const ventas = obtenerVentas()
  const ventasDelMes = ventas.filter(v => v.fecha.startsWith(mesActual()))

  return {
    totalVentas: ventas.length,
    ingresosMes: ventasDelMes.reduce((acc, v) => acc + v.monto, 0),
    comisionesMes: ventasDelMes.reduce((acc, v) => acc + (v.comision || 0), 0),
    sinStock: obtenerMotos().filter(m => m.stock === 0).length,
    pedidosPendientes: obtenerConsultas().filter(c => c.estado === 'Pendiente').length,
  }
}
