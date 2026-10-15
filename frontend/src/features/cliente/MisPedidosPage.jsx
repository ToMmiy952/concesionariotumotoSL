import { Link } from 'react-router'
import { obtenerVentas } from '../vendedor/ventasService'
import { obtenerSesion } from '../auth/authService'

const pesos = n =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

function MisPedidosPage() {
  const sesion = obtenerSesion()
  const pedidos = obtenerVentas()
    .filter(v => v.tipo === 'Accesorio Online' && v.idCliente === sesion.id)
    .reverse() // los más recientes primero

  return (
    <main className="container my-5">
      <h2 className="mb-4">Mis pedidos</h2>

      {pedidos.length === 0 && (
        <div className="alert alert-light border">
          Todavía no realizaste compras. <Link to="/accesorios">Mirá los accesorios</Link>
        </div>
      )}

      <div className="row g-3">
        {pedidos.map(p => (
          <div className="col-12" key={p.id}>
            <div className="bg-white rounded shadow-sm p-3">
              <div className="d-flex justify-content-between flex-wrap mb-2">
                <strong>Pedido #{p.id}</strong>
                <span className="text-muted">{p.fecha} {p.hora}</span>
              </div>
              <ul className="list-unstyled mb-2">
                {p.items.map((i, idx) => (
                  <li key={idx} className="d-flex justify-content-between">
                    <span>{i.nombre}{i.talle ? ` (talle ${i.talle})` : ''} x{i.cantidad}</span>
                    <span>{pesos(i.precioUnitario * i.cantidad)}</span>
                  </li>
                ))}
              </ul>
              <div className="d-flex justify-content-between border-top pt-2">
                <strong>Total</strong>
                <strong className="text-primary">{pesos(p.monto)}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
export default MisPedidosPage
