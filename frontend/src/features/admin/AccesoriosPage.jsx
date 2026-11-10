import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { listarAccesorios, eliminarAccesorio } from './accesoriosService'

const pesos = n => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

function AccesoriosPage() {
  const [accesorios, setAccesorios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null) // error al cargar la lista
  const [aviso, setAviso] = useState(null) // resultado de la última acción: { tipo, texto }
  const [procesando, setProcesando] = useState(null) // id del accesorio con una baja en curso
  const [recarga, setRecarga] = useState(0) // cambiar este número vuelve a pedir la lista

  useEffect(() => {
    let cancelado = false
    async function cargar() {
      const r = await listarAccesorios()
      if (cancelado) return
      if (r.ok) {
        setAccesorios(r.accesorios)
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

  async function manejarBaja(accesorio) {
    if (!confirm(`¿Eliminar "${accesorio.nombre}" del catálogo?`)) return
    setProcesando(accesorio.id_producto)
    setAviso(null)
    const r = await eliminarAccesorio(accesorio.id_producto)
    setProcesando(null)
    setAviso(r.ok
      ? { tipo: 'success', texto: `"${accesorio.nombre}" se dio de baja del catálogo.` }
      : { tipo: 'danger', texto: r.error })
    setRecarga(n => n + 1) // releemos la lista para ver el estado real
  }

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Accesorios</h2>
        <Link to="/gestor/accesorios/nuevo" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i>Nuevo accesorio
        </Link>
      </div>

      {cargando && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-secondary">Cargando accesorios...</p>
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

          {accesorios.length === 0 && (
            <div className="alert alert-light border">No hay accesorios cargados en el catálogo.</div>
          )}

          {accesorios.length > 0 && (
            <div className="tarjeta-tabla">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Marca</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Talle</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accesorios.map(a => (
                      <tr key={a.id_producto}>
                        <td><img src={a.imagen} alt={a.nombre} className="miniatura-moto" /></td>
                        <td>{a.marca}</td>
                        <td>{a.nombre}</td>
                        <td>{a.categoria}</td>
                        <td>{a.talle || '—'}</td>
                        <td>{pesos(a.precio)}</td>
                        <td>
                          {/* badge verde si hay stock, rojo si es 0 */}
                          <span className={`badge ${a.stock > 0 ? 'text-bg-success' : 'text-bg-danger'}`}>{a.stock}</span>
                        </td>
                        <td className="text-end">
                          <Link to={`/gestor/accesorios/${a.id_producto}/editar`} className="btn btn-sm btn-outline-primary me-2">
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => manejarBaja(a)}
                            disabled={procesando === a.id_producto}
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

export default AccesoriosPage
