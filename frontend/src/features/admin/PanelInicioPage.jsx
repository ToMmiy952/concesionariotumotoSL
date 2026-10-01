import { calcularMetricas, ventas } from './metricasService'

function PanelInicioPage() {
  const m = calcularMetricas()
  const pesos = n => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

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
    <div><h3>Pedidos pendientes</h3><p>{m.pedidosPendientes}</p></div>
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
              <tr><th>Fecha</th><th>Moto</th><th>Vendedor</th><th className="text-end">Monto</th></tr>
            </thead>
            <tbody>
              {ventas.map(v => (
                <tr key={v.id}>
                    <td>{v.fecha}</td>
                    <td>{v.motoModelo}</td>
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