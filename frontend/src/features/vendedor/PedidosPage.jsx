import { useEffect, useState } from 'react'
import { listarReservas, cambiarEstadoReserva, concretarVenta, ESTADOS, ETIQUETA_ESTADO } from './reservasService'
import { formatearFechaHora } from '../../shared/utils/fechas'

const COLOR_ESTADO = {
  vigente: 'text-bg-warning',
  concretada: 'text-bg-success',
  vencida: 'text-bg-danger',
  cancelada: 'text-bg-secondary',
}

function PedidosPage() {
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null) // error al cargar la lista
  const [aviso, setAviso] = useState(null) // resultado de la última acción: { tipo, texto }
  const [procesando, setProcesando] = useState(null) // id de la reserva con una acción en curso
  const [filtro, setFiltro] = useState('Todos')
  const [recarga, setRecarga] = useState(0) // cambiar este número vuelve a pedir la lista

  useEffect(() => {
    let cancelado = false
    async function cargar() {
      const r = await listarReservas()
      if (cancelado) return
      if (r.ok) {
        setReservas(r.reservas)
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

  async function ejecutar(reserva, accion, mensajeOk) {
    setProcesando(reserva.id_reserva)
    setAviso(null)
    const r = await accion()
    setProcesando(null)
    setAviso(r.ok ? { tipo: 'success', texto: mensajeOk } : { tipo: 'danger', texto: r.error })
    setRecarga(n => n + 1) // releemos la lista para ver el estado real
  }

  function concretar(c) {
    if (!confirm(`¿Concretar la venta de ${c.marca} ${c.modelo} a ${c.nombre_interesado}?`)) return
    ejecutar(c, () => concretarVenta(c.id_moto, c.id_reserva), 'Venta registrada: la reserva quedó concretada.')
  }

  function cancelar(c) {
    if (!confirm(`¿Cancelar la reserva de ${c.nombre_interesado}?`)) return
    ejecutar(c, () => cambiarEstadoReserva(c.id_reserva, 'cancelada'), 'Reserva cancelada.')
  }

  const visibles = filtro === 'Todos' ? reservas : reservas.filter(c => c.estado_reserva === filtro)

  return (
    <section>
      <h2 className="mb-3">Pedidos y reservas</h2>

      {cargando && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-secondary">Cargando reservas...</p>
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

          <div className="btn-group mb-3 flex-wrap">
            {['Todos', ...ESTADOS].map(e => (
              <button
                key={e}
                className={`btn btn-sm ${filtro === e ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFiltro(e)}
              >
                {ETIQUETA_ESTADO[e] ?? e}
              </button>
            ))}
          </div>

          {visibles.length === 0 && <div className="alert alert-light border">No hay reservas para mostrar.</div>}

          <div className="row g-3">
            {visibles.map(c => {
              const vigente = c.estado_reserva === 'vigente'
              const ocupada = procesando === c.id_reserva
              return (
                <div className="col-12 col-xl-6" key={c.id_reserva}>
                  <div className="tarjeta-tabla h-100">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h3 className="h6 mb-0">{c.nombre_interesado}</h3>
                        <small className="text-muted">{c.email_interesado}</small>
                        {c.telefono_interesado && <small className="text-muted d-block">Tel: {c.telefono_interesado}</small>}
                      </div>
                      <span className={`badge ${COLOR_ESTADO[c.estado_reserva]}`}>{ETIQUETA_ESTADO[c.estado_reserva]}</span>
                    </div>

                    <p className="mb-1"><i className="bi bi-bicycle me-2"></i>{c.marca} {c.modelo}</p>
                    <p className="mb-1">
                      <i className="bi bi-calendar-event me-2"></i>{c.horario_preferido || 'Sin horario preferido'}
                    </p>
                    <p className="mb-1 text-muted">
                      <i className="bi bi-hourglass-split me-2"></i>
                      {vigente ? 'La reserva vence' : 'Vencimiento'}: {formatearFechaHora(c.fecha_vencimiento)}
                    </p>
                    <p className="mb-3"><i className="bi bi-chat-left-text me-2"></i>{c.comentarios || 'Sin comentario'}</p>

                    {c.moto_sin_stock && (
                      <div className="alert alert-warning py-2">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Esta moto se quedó sin stock: comunicate con el cliente para avisarle.
                      </div>
                    )}

                    <div className="mt-3 d-flex flex-wrap gap-2">
                      {vigente && (
                        <>
                          <button className="btn btn-success" disabled={ocupada || c.moto_sin_stock} onClick={() => concretar(c)}>
                            <i className="bi bi-cart-check me-1"></i>Concretar venta
                          </button>
                          <button className="btn btn-outline-secondary" disabled={ocupada} onClick={() => cancelar(c)}>
                            <i className="bi bi-x-circle me-1"></i>Cancelar reserva
                          </button>
                        </>
                      )}
                      {c.estado_reserva === 'concretada' && (
                        <div className="alert alert-success py-2 mb-0 w-100">
                          <i className="bi bi-check-circle me-2"></i>Venta registrada
                        </div>
                      )}
                      {c.estado_reserva === 'cancelada' && (
                        <div className="alert alert-secondary py-2 mb-0 w-100">
                          <i className="bi bi-x-circle me-2"></i>Reserva cancelada
                        </div>
                      )}
                      {c.estado_reserva === 'vencida' && (
                        <div className="alert alert-danger py-2 mb-0 w-100">
                          <i className="bi bi-clock-history me-2"></i>La reserva venció a las 48 hs y la moto quedó liberada
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}
export default PedidosPage
