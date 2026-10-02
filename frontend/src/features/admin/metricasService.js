import { obtenerMotos } from './productosService'
import { obtenerVentas } from '../vendedor/ventasService'
import { obtenerConsultas } from '../vendedor/consultasService'

export function calcularMetricas() {
  const ventas = obtenerVentas()
  const mesActual = new Date().toISOString().slice(0, 7)
  const ventasDelMes = ventas.filter(v => v.fecha.startsWith(mesActual))

  return {
    totalVentas: ventas.length,
    ingresosMes: ventasDelMes.reduce((acc, v) => acc + v.monto, 0),
    comisionesMes: ventasDelMes.reduce((acc, v) => acc + v.comision, 0),
    sinStock: obtenerMotos().filter(m => m.stock === 0).length,
    pedidosPendientes: obtenerConsultas().filter(c => c.estado === 'Pendiente').length,
  }
}