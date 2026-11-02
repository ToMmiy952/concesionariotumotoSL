import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { listarVentasConDetalle } from '../vendedor/ventasService'
import { formatearFechaHora } from '../../shared/utils/fechas'

const pesos = n =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

function MisPedidosPage() {
  const [pedidos, setPedidos] = useState(null) // null mientras carga
  const [error, setError] = useState(null)

  // GET /ventas + GET /ventas/:id: la API ya devuelve solo las compras del cliente logueado
  useEffect(() => {
    listarVentasConDetalle().then(r => {
      if (!r.ok) return setError(r.error)
      // el filtro por tipo y el orden (más recientes primero) se hacen acá
      setPedidos(r.ventas.filter(v => v.tipo === 'Accesorio Online').reverse())
    })
  }, [])

  return (
    <main className="container my-5">
      <h2 className="mb-4">Mis pedidos</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {!error && pedidos === null && <p className="text-secondary">Cargando pedidos...</p>}

      {pedidos?.length === 0 && (
        <div className="alert alert-light border">
          Todavía no realizaste compras. <Link to="/accesorios">Mirá los accesorios</Link>
        </div>
      )}

      <div className="row g-3">
        {pedidos?.map(p => (
          <div className="col-12" key={p.id}>
            <div className="bg-white rounded shadow-sm p-3">
              <div className="d-flex justify-content-between flex-wrap mb-2">
                <strong>Pedido #{p.id}</strong>
                <span className="text-muted">{formatearFechaHora(p.fecha)}</span>
              </div>
              <ul className="list-unstyled mb-2">
                {p.items.map((i, idx) => (
                  <li key={idx} className="d-flex justify-content-between">
                    <span>{i.nombre} x{i.cantidad}</span>
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
