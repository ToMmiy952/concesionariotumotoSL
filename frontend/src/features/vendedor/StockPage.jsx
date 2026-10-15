import { useState } from 'react'
import { obtenerMotos, cambiarStock } from '../admin/productosService'
import { registrarVenta, calcularComision } from './ventasService'
import { obtenerSesion } from '../auth/authService'
import { sincronizarMotosReservadas } from './consultasService'

const pesos = n =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

function StockPage() {
  const [motos, setMotos] = useState(obtenerMotos)
  const sesion = obtenerSesion()

  function ajustar(id, cantidad) {
    cambiarStock(id, cantidad)
    sincronizarMotosReservadas() // si tiene reservas abiertas vuelve a "Reservada" en lugar de "Disponible"
    setMotos(obtenerMotos())
  }

  function vender(m) {
    const msg = `¿Registrar la venta de ${m.marca} ${m.modelo} por ${pesos(m.precio)}?\nTu comisión: ${pesos(calcularComision(m.precio))}`
    if (!confirm(msg)) return
    registrarVenta(m.id, sesion)
    sincronizarMotosReservadas()
    setMotos(obtenerMotos())
  }

  return (
    <section>
      <h2 className="mb-3">Consulta de stock</h2>
      <div className="tarjeta-tabla">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th></th><th>Moto</th><th>Precio</th><th>Unidades</th><th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {motos.map(m => (
                <tr key={m.id}>
                  <td><img src={m.imagen} alt={m.modelo} className="miniatura-moto" /></td>
                  <td>{m.marca} {m.modelo}</td>
                  <td>{pesos(m.precio)}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <button className="btn btn-sm btn-outline-secondary" disabled={m.stock === 0}
                              onClick={() => ajustar(m.id, -1)}>
                        <i className="bi bi-dash"></i>
                      </button>
                      <span className={`badge ${m.stock > 0 ? 'text-bg-success' : 'text-bg-danger'}`}>{m.stock}</span>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => ajustar(m.id, 1)}>
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                  </td>
                  <td>{m.estado}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-primary" disabled={m.stock === 0} onClick={() => vender(m)}>
                      <i className="bi bi-cart-check me-1"></i>Registrar venta
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
export default StockPage