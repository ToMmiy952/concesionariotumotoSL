import { obtenerVentas, PORCENTAJE_COMISION } from './ventasService'
import { obtenerSesion } from '../auth/authService'
import { mesActual } from '../../shared/utils/fechas'

const pesos = n =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

function ComisionesPage() {
  const sesion = obtenerSesion()
  const mias = obtenerVentas().filter(v => v.idVendedor === sesion.id)
  const delMes = mias.filter(v => v.fecha.startsWith(mesActual()))

  const totalMes = delMes.reduce((acc, v) => acc + v.comision, 0)
  const totalHistorico = mias.reduce((acc, v) => acc + v.comision, 0)

  return (
    <section>
      <h2 className="mb-1">Mis comisiones</h2>
      <p className="text-muted">Comisión actual: {PORCENTAJE_COMISION}% por venta.</p>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="tarjeta-metrica">
            <i className="bi bi-calendar-month icono"></i>
            <div><h3>Comisión del mes</h3><p>{pesos(totalMes)}</p></div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="tarjeta-metrica">
            <i className="bi bi-piggy-bank icono"></i>
            <div><h3>Total acumulado</h3><p>{pesos(totalHistorico)}</p></div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="tarjeta-metrica">
            <i className="bi bi-bag-check icono"></i>
            <div><h3>Ventas realizadas</h3><p>{mias.length}</p></div>
          </div>
        </div>
      </div>

      <div className="tarjeta-tabla">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr><th>Fecha</th><th>Moto</th><th className="text-end">Monto</th><th className="text-end">Comisión</th></tr>
            </thead>
            <tbody>
              {mias.map(v => (
                <tr key={v.id}>
                  <td>{v.fecha}</td>
                  <td>{v.motoModelo}</td>
                  <td className="text-end">{pesos(v.monto)}</td>
                  <td className="text-end">{pesos(v.comision)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
export default ComisionesPage