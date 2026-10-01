import { useState } from 'react'
import { Link } from 'react-router'
import { obtenerMotos, eliminarMoto } from './productosService'

function ProductosPage() {
  const [motos, setMotos] = useState(obtenerMotos)

  function manejarBaja(id) {
    if (!confirm('¿Eliminar esta moto del catálogo?')) return
    eliminarMoto(id)
    setMotos(obtenerMotos()) // recargamos el estado desde el storage
  }

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Motos</h2>
        <Link to="/gestor/productos/nuevo" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i>Nueva moto
        </Link>
      </div>

      <div className="tarjeta-tabla">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr><th></th><th>Marca</th><th>Modelo</th><th>Precio</th><th>Stock</th><th className="text-end">Acciones</th></tr>
            </thead>
            <tbody>
              {motos.map(m => (
                <tr key={m.id}>
                  <td><img src={m.imagen} alt={m.modelo} className="miniatura-moto" /></td>
                  <td>{m.marca}</td>
                  <td>{m.modelo}</td>
                  <td>{m.precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}</td>
                  <td>
                    {/* badge verde si hay stock, rojo si es 0 */}
                    <span className={`badge ${m.stock > 0 ? 'text-bg-success' : 'text-bg-danger'}`}>{m.stock}</span>
                  </td>
                  <td className="text-end">
                    <Link to={`/gestor/productos/${m.id}/editar`} className="btn btn-sm btn-outline-primary me-2">
                      <i className="bi bi-pencil"></i>
                    </Link>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => manejarBaja(m.id)}>
                      <i className="bi bi-trash"></i>
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
export default ProductosPage