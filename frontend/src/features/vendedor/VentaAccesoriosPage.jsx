import { useEffect, useMemo, useState } from 'react'
import { listarAccesorios } from '../admin/accesoriosService'
import { registrarVentaAccesorios } from './ventasService'
import ModalConfirmar from '../../shared/components/ModalConfirmar'
import { pesos } from '../../shared/utils/formato'

// Venta de mostrador de accesorios: no lleva cliente ni vendedor y no genera comisión
function VentaAccesoriosPage() {
  const [accesorios, setAccesorios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null) // error al cargar la lista
  const [aviso, setAviso] = useState(null) // resultado de la última venta: { tipo, texto }
  const [busqueda, setBusqueda] = useState('')
  const [cantidades, setCantidades] = useState({}) // { idProducto: cantidad } de lo que se va a vender
  const [confirmando, setConfirmando] = useState(false)
  const [procesando, setProcesando] = useState(false)
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

  // Cambia la cantidad de un accesorio sin pasarse del stock ni bajar de 0
  function cambiarCantidad(a, delta) {
    setCantidades(prev => {
      const nueva = Math.min(a.stock, Math.max(0, (prev[a.id_producto] ?? 0) + delta))
      return { ...prev, [a.id_producto]: nueva } // una cantidad en 0 se ignora al armar el resumen
    })
  }

  const seleccion = useMemo(
    () => accesorios
      .filter(a => cantidades[a.id_producto] > 0)
      .map(a => ({ ...a, cantidad: cantidades[a.id_producto] })),
    [accesorios, cantidades]
  )
  const total = seleccion.reduce((acc, a) => acc + a.precio * a.cantidad, 0)

  const texto = busqueda.trim().toLowerCase()
  const visibles = accesorios.filter(a =>
    !texto || `${a.nombre} ${a.marca} ${a.categoria}`.toLowerCase().includes(texto)
  )

  async function registrar() {
    setProcesando(true)
    setAviso(null)
    const r = await registrarVentaAccesorios(seleccion.map(a => ({ idAccesorio: a.id_producto, cantidad: a.cantidad })))
    setProcesando(false)
    setConfirmando(false)
    if (r.ok) {
      setCantidades({})
      setAviso({ tipo: 'success', texto: `Venta registrada por ${pesos(r.venta.monto)}. El stock ya se descontó.` })
    } else {
      setAviso({ tipo: 'danger', texto: r.error })
    }
    setRecarga(n => n + 1) // releemos la lista para ver el stock real
  }

  return (
    <section>
      <h2 className="mb-1">Venta de accesorios</h2>
      <p className="text-muted">Venta presencial de mostrador. No lleva cliente ni genera comisión.</p>

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

          <div className="row g-3">
            <div className="col-12 col-xl-8">
              <div className="tarjeta-tabla">
                <input
                  type="search"
                  className="form-control mb-3"
                  placeholder="Buscar por nombre, marca o categoría..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />

                {visibles.length === 0 && <p className="text-muted mb-0">No hay accesorios que coincidan.</p>}

                {visibles.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Accesorio</th>
                          <th>Precio</th>
                          <th>Stock</th>
                          <th className="text-end">Cantidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibles.map(a => {
                          const cantidad = cantidades[a.id_producto] ?? 0
                          return (
                            <tr key={a.id_producto}>
                              <td><img src={a.imagen} alt={a.nombre} className="miniatura-moto" /></td>
                              <td>
                                {a.nombre}
                                <div className="small text-muted">{a.marca} · {a.categoria}{a.talle ? ` · Talle ${a.talle}` : ''}</div>
                              </td>
                              <td>{pesos(a.precio)}</td>
                              <td>
                                <span className={`badge ${a.stock > 0 ? 'text-bg-success' : 'text-bg-danger'}`}>{a.stock}</span>
                              </td>
                              <td className="text-end text-nowrap">
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  disabled={cantidad === 0}
                                  onClick={() => cambiarCantidad(a, -1)}
                                  aria-label={`Quitar una unidad de ${a.nombre}`}
                                >
                                  <i className="bi bi-dash"></i>
                                </button>
                                <span className="d-inline-block text-center fw-bold" style={{ minWidth: '2.2rem' }}>{cantidad}</span>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  disabled={cantidad >= a.stock}
                                  onClick={() => cambiarCantidad(a, 1)}
                                  aria-label={`Agregar una unidad de ${a.nombre}`}
                                >
                                  <i className="bi bi-plus"></i>
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-xl-4">
              <div className="tarjeta-tabla">
                <h3 className="h5 mb-3"><i className="bi bi-receipt me-2"></i>Resumen de la venta</h3>
                {seleccion.length === 0 && <p className="text-muted">Todavía no agregaste accesorios.</p>}
                {seleccion.map(a => (
                  <div key={a.id_producto} className="d-flex justify-content-between gap-2 mb-2">
                    <span>{a.cantidad} × {a.nombre}</span>
                    <strong className="text-nowrap">{pesos(a.precio * a.cantidad)}</strong>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between fs-5 mb-3">
                  <span>Total</span>
                  <strong>{pesos(total)}</strong>
                </div>
                <button
                  className="btn btn-primary w-100"
                  disabled={seleccion.length === 0}
                  onClick={() => setConfirmando(true)}
                >
                  <i className="bi bi-cart-check me-1"></i>Registrar venta
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <ModalConfirmar
        abierto={confirmando}
        titulo="Registrar venta de accesorios"
        icono="bi-bag-check"
        textoConfirmar="Registrar venta"
        procesando={procesando}
        onConfirmar={registrar}
        onCancelar={() => setConfirmando(false)}
      >
        <p className="mb-1">Se descuenta el stock de {seleccion.length === 1 ? 'este accesorio' : `estos ${seleccion.length} accesorios`}.</p>
        <div className="modal-confirmar-detalle"><span>Total</span><strong>{pesos(total)}</strong></div>
      </ModalConfirmar>
    </section>
  )
}

export default VentaAccesoriosPage
