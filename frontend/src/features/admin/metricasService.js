import ventas from '../../../../backend/data/ventas.json'
import { obtenerMotos } from './productosService'

export { ventas }

export function calcularMetricas() {
  const mesActual = new Date().toISOString().slice(0, 7) // "2026-09"
  const ventasDelMes = ventas.filter(v => v.fecha.startsWith(mesActual))

  return {
    totalVentas: ventas.length,
    ingresosMes: ventasDelMes.reduce((acc, v) => acc + v.monto, 0),
    comisionesMes: ventasDelMes.reduce((acc, v) => acc + v.comision, 0),
    sinStock: obtenerMotos().filter(m => m.stock === 0).length,
    pedidosPendientes: 0, // se conecta cuando exista el modulo de pedidos (Integrante 2)
  }
}