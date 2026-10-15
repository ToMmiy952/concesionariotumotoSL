import { useState } from 'react'
import { obtenerConsultas, actualizarConsulta, ESTADOS, ESTADOS_ABIERTOS } from './consultasService'
import { obtenerMoto } from '../admin/productosService'
import { registrarVenta } from './ventasService'
import { obtenerSesion } from '../auth/authService'
import { formatearFechaHora } from '../../shared/utils/fechas'

const COLOR_ESTADO = {
  Pendiente: 'text-bg-warning',
  Contactado: 'text-bg-info',
  'En trámite': 'text-bg-primary',
  Entregado: 'text-bg-success',
  Cerrado: 'text-bg-secondary',
  Vencida: 'text-bg-danger',
}

const HORARIOS = { manana: 'Mañana', tarde: 'Tarde', noche: 'Noche' }

// el paso siguiente de los dos primeros estados (después de "En trámite" hay dos caminos)
const SIGUIENTE = {
  Pendiente: { estado: 'Contactado', texto: 'Contactar', icono: 'bi-telephone' },
  Contactado: { estado: 'En trámite', texto: 'Pasar a En trámite', icono: 'bi-arrow-right-circle' },
}

function PedidosPage() {
  const [consultas, setConsultas] = useState(obtenerConsultas)
  const [filtro, setFiltro] = useState('Todos')
  const sesion = obtenerSesion()

  function cambiar(id, cambios) {
    actualizarConsulta(id, cambios)
    setConsultas(obtenerConsultas()) // releemos para que React redibuje
  }

  function concretarVenta(c) {
    const moto = obtenerMoto(c.idMoto)
    if (!moto) {
      alert('La moto de esta consulta ya no está en el catálogo.')
      return
    }
    if (!confirm(`¿Concretar la venta de ${moto.marca} ${moto.modelo} a ${c.nombre}?`)) return

    if (!registrarVenta(c.idMoto, sesion)) {
      alert('No hay stock de esta moto.')
      return
    }
    cambiar(c.id, { estado: 'Entregado', ventaRegistrada: true })
  }

  function cerrarPedido(c) {
    if (!confirm(`¿Cerrar el pedido de ${c.nombre} sin concretar la venta?`)) return
    cambiar(c.id, { estado: 'Cerrado' })
  }

  const visibles = filtro === 'Todos' ? consultas : consultas.filter(c => c.estado === filtro)

  return (
    <section>
      <h2 className="mb-3">Pedidos y consultas</h2>

      <div className="btn-group mb-3 flex-wrap">
        {['Todos', ...ESTADOS].map(e => (
          <button
            key={e}
            className={`btn btn-sm ${filtro === e ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFiltro(e)}
          >
            {e}
          </button>
        ))}
      </div>

      {visibles.length === 0 && <div className="alert alert-light border">No hay consultas para mostrar.</div>}

      <div className="row g-3">
        {visibles.map(c => {
          const moto = obtenerMoto(c.idMoto)
          const paso = SIGUIENTE[c.estado]
          const abierta = ESTADOS_ABIERTOS.includes(c.estado)
          const sinStock = abierta && moto && moto.stock === 0
          return (
            <div className="col-12 col-xl-6" key={c.id}>
              <div className="tarjeta-tabla h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h3 className="h6 mb-0">{c.nombre}</h3>
                    <small className="text-muted">{c.email}</small>
                    {c.telefono && <small className="text-muted d-block">Tel: {c.telefono}</small>}
                  </div>
                  <span className={`badge ${COLOR_ESTADO[c.estado]}`}>{c.estado}</span>
                </div>

                <p className="mb-1"><i className="bi bi-bicycle me-2"></i>
                  {moto ? `${moto.marca} ${moto.modelo}` : 'Moto no disponible'}
                </p>
                <p className="mb-1">
                  <i className="bi bi-calendar-event me-2"></i>
                  {c.fecha || 'Sin fecha preferida'} · {HORARIOS[c.horario] ?? c.horario}
                </p>
                {c.fechaVencimiento && (
                  <p className="mb-1 text-muted">
                    <i className="bi bi-hourglass-split me-2"></i>
                    {abierta ? 'La reserva vence' : 'Venció'}: {formatearFechaHora(c.fechaVencimiento)}
                  </p>
                )}
                <p className="mb-3"><i className="bi bi-chat-left-text me-2"></i>{c.comentario || 'Sin comentario'}</p>

                {sinStock && (
                  <div className="alert alert-warning py-2">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Esta moto se quedó sin stock: comunicate con el cliente para avisarle.
                  </div>
                )}

                <label className="form-label">Notas de seguimiento</label>
                <textarea
                  className="form-control"
                  rows="2"
                  defaultValue={c.notas}
                  onBlur={e => cambiar(c.id, { notas: e.target.value })} // guarda al salir del campo
                />

                <div className="mt-3 d-flex flex-wrap gap-2">
                  {/* Pendiente y Contactado: un solo botón que avanza al siguiente estado */}
                  {paso && (
                    <button className="btn btn-primary" onClick={() => cambiar(c.id, { estado: paso.estado })}>
                      <i className={`bi ${paso.icono} me-1`}></i>{paso.texto}
                    </button>
                  )}

                  {/* Pendiente y Contactado también pueden cerrarse sin venta */}
                  {paso && (
                    <button className="btn btn-outline-secondary" onClick={() => cerrarPedido(c)}>
                      <i className="bi bi-x-circle me-1"></i>Cerrar pedido
                    </button>
                  )}

                  {/* En trámite: dos caminos */}
                  {c.estado === 'En trámite' && (
                    <>
                      <button className="btn btn-success" disabled={sinStock} onClick={() => concretarVenta(c)}>
                        <i className="bi bi-cart-check me-1"></i>Concretar venta
                      </button>
                      <button className="btn btn-outline-secondary" onClick={() => cerrarPedido(c)}>
                        <i className="bi bi-x-circle me-1"></i>Cerrar pedido
                      </button>
                    </>
                  )}

                  {c.estado === 'Entregado' && (
                    <div className="alert alert-success py-2 mb-0 w-100">
                      <i className="bi bi-check-circle me-2"></i>Venta registrada
                    </div>
                  )}
                  {c.estado === 'Cerrado' && (
                    <div className="alert alert-secondary py-2 mb-0 w-100">
                      <i className="bi bi-x-circle me-2"></i>Pedido cerrado sin venta
                    </div>
                  )}
                  {c.estado === 'Vencida' && (
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
    </section>
  )
}
export default PedidosPage
