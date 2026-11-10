import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { listarMotos, eliminarMoto } from './motosService'

const pesos = n => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

function ProductosPage() {
  const [motos, setMotos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null) // error al cargar la lista
  const [aviso, setAviso] = useState(null) // resultado de la última acción: { tipo, texto }
  const [procesando, setProcesando] = useState(null) // id de la moto con una baja en curso
  const [recarga, setRecarga] = useState(0) // cambiar este número vuelve a pedir la lista

  useEffect(() => {
    let cancelado = false
    async function cargar() {
      const r = await listarMotos()
      if (cancelado) return
      if (r.ok) {
        setMotos(r.motos)
        setError(null)
      } else {
        setError(r.error)
      }
      setCargando(false)
    }
    cargar()
    return () => { cancelado = true }
  }, [recarga])

  function reintentar() {
    setCargando(true)
    setRecarga(n => n + 1)
  }

  async function manejarBaja(moto) {
    if (!confirm(`¿Eliminar "${moto.marca} ${moto.modelo}" del catálogo?`)) return
    setProcesando(moto.id_producto)
    setAviso(null)
    const r = await eliminarMoto(moto.id_producto)
    setProcesando(null)
    setAviso(r.ok
      ? { tipo: 'success', texto: `"${moto.marca} ${moto.modelo}" se dio de baja del catálogo.` }
      : { tipo: 'danger', texto: r.error })
    setRecarga(n => n + 1) // releemos la lista para ver el estado real
  }

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Motos</h2>
        <Link to="/gestor/productos/nuevo" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i>Nueva moto
        </Link>
      </div>

      {cargando && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-secondary">Cargando motos...</p>
        </div>
      )}

      {!cargando && error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={reintentar}>Reintentar</button>
        </div>
      )}

      {!cargando && !error && (
        <>
          {aviso && <div className={`alert alert-${aviso.tipo}`} role="alert">{aviso.texto}</div>}

          {motos.length === 0 && (
            <div className="alert alert-light border">No hay motos cargadas en el catálogo.</div>
          )}

          {motos.length > 0 && (
            <div className="tarjeta-tabla">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Marca</th>
                      <th>Modelo</th>
                      <th>Cilindrada</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {motos.map(m => (
                      <tr key={m.id_producto}>
                        <td><img src={m.imagen} alt={m.modelo} className="miniatura-moto" /></td>
                        <td>{m.marca}</td>
                        <td>{m.modelo}</td>
                        <td>{m.cilindrada ? `${m.cilindrada} cc` : '—'}</td>
                        <td>{pesos(m.precio)}</td>
                        <td>
                          {/* badge verde si hay stock, rojo si es 0 */}
                          <span className={`badge ${m.stock > 0 ? 'text-bg-success' : 'text-bg-danger'}`}>{m.stock}</span>
                        </td>
                        <td>{m.estado}</td>
                        <td className="text-end">
                          <Link to={`/gestor/productos/${m.id_producto}/editar`} className="btn btn-sm btn-outline-primary me-2">
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => manejarBaja(m)}
                            disabled={procesando === m.id_producto}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default ProductosPage
