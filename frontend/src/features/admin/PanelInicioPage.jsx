import { useEffect, useState } from 'react'
import { calcularMetricas } from './metricasService'
import { contarReservasVigentes } from '../vendedor/reservasService'
import { obtenerVentas } from '../vendedor/ventasService'

function PanelInicioPage() {
  const m = calcularMetricas()
  const [reservasVigentes, setReservasVigentes] = useState(null) // null mientras carga o si la API falla

  useEffect(() => {
    contarReservasVigentes().then(setReservasVigentes)
  }, [])
  const pesos = n => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
  const ventas = obtenerVentas()

  return (
    <section>
      <h2 className="mb-4">Panel de control</h2>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="tarjeta-metrica">
            <i className="bi bi-bag-check icono"></i>
            <div><h3>Total de ventas</h3><p>{m.totalVentas}</p></div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="tarjeta-metrica">
            <i className="bi bi-cash-coin icono"></i>
            <div><h3>Ingresos del mes</h3><p>{pesos(m.ingresosMes)}</p></div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
  <div className="tarjeta-metrica">
    <i className="bi bi-hourglass-split icono"></i>
    <div><h3>Reservas vigentes</h3><p>{reservasVigentes ?? '—'}</p></div>
  </div>
</div>
<div className="col-12 col-md-6 col-xl-3">
  <div className="tarjeta-metrica">
    <i className="bi bi-exclamation-triangle icono"></i>
    <div><h3>Sin stock</h3><p>{m.sinStock}</p></div>
  </div>
</div>
      </div>

      <div className="tarjeta-tabla">
        <h3 className="h5 mb-3">Reporte de ventas</h3>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr><th>Fecha</th><th>Detalle</th><th>Tipo</th><th>Vendedor</th><th className="text-end">Monto</th></tr>
            </thead>
            <tbody>
              {ventas.map(v => (
                <tr key={v.id}>
                    <td>{v.fecha}</td>
                    <td>{v.descripcion ?? v.motoModelo}</td>
                    <td>{v.tipo ?? 'Moto'}</td>
                    <td>{v.nombreVendedor}</td>
                    <td className="text-end">{pesos(v.monto)}</td>
                </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
export default PanelInicioPage