import { useEffect, useState } from 'react'
import { listarMotos } from '../admin/motosService'
import { registrarVentaMoto, calcularComision } from './ventasService'

const pesos = n =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

function StockPage() {
  const [motos, setMotos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null) // error al cargar la lista
  const [aviso, setAviso] = useState(null) // resultado de la última venta: { tipo, texto }
  const [procesando, setProcesando] = useState(null) // id de la moto con una venta en curso
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

  async function vender(moto) {
    const msg = `¿Registrar la venta de ${moto.marca} ${moto.modelo} por ${pesos(moto.precio)}?\nTu comisión: ${pesos(calcularComision(moto.precio))}`
    if (!confirm(msg)) return
    setProcesando(moto.id_producto)
    setAviso(null)
    const r = await registrarVentaMoto(moto.id_producto)
    setProcesando(null)
    setAviso(r.ok
      ? { tipo: 'success', texto: `Venta de ${moto.marca} ${moto.modelo} registrada.` }
      : { tipo: 'danger', texto: r.error })
    setRecarga(n => n + 1) // releemos la lista para ver el stock real
  }

  return (
    <section>
      <h2 className="mb-1">Consulta de stock</h2>
      <p className="text-muted">El stock y el estado se actualizan automáticamente con cada venta.</p>

      {cargando && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-secondary">Cargando stock...</p>
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
                      <th>Moto</th>
                      <th>Precio</th>
                      <th>Unidades</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {motos.map(m => (
                      <tr key={m.id_producto}>
                        <td><img src={m.imagen} alt={m.modelo} className="miniatura-moto" /></td>
                        <td>{m.marca} {m.modelo}</td>
                        <td>{pesos(m.precio)}</td>
                        <td>
                          {/* badge verde si hay stock, rojo si es 0 */}
                          <span className={`badge ${m.stock > 0 ? 'text-bg-success' : 'text-bg-danger'}`}>{m.stock}</span>
                        </td>
                        <td>{m.estado}</td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-primary"
                            disabled={m.stock === 0 || procesando === m.id_producto}
                            onClick={() => vender(m)}
                          >
                            <i className="bi bi-cart-check me-1"></i>
                            {procesando === m.id_producto ? 'Registrando...' : 'Registrar venta'}
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

export default StockPage
