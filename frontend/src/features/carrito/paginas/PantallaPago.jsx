import { useState } from 'react'
import { useNavigate, useOutletContext, Link } from 'react-router'
import { obtenerSesion } from '../../auth/authService'

function PantallaPago() {
  const navigate = useNavigate()
  const { carrito, vaciarCarrito } = useOutletContext()
  const usuario = obtenerSesion() || {}

  // Estado del formulario controlado
  const [formData, setFormData] = useState({
    dni: '',
    telefono: '',
    tipoEntrega: 'domicilio', 
    direccion: '',
    metodoPago: 'credito', 
    numeroTarjeta: '',
    nombreTarjeta: '',
    vencimiento: '',
    cvv: ''
  })

  // Manejador único de inputs
  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Cálculo del total de la compra
  const total = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  )

  function handleSubmit(e) {
    e.preventDefault()
    // Simulación de finalización exitosa
    alert('¡Compra realizada con éxito! Muchas gracias.')
    if (vaciarCarrito) vaciarCarrito()
    navigate('/mis-pedidos')
  }

  if (carrito.length === 0) {
    return (
      <div className="container my-5 text-center">
        <h2>No hay productos en el carrito</h2>
        <p className="text-secondary">
          Agregá accesorios desde el catálogo antes de finalizar la compra.
        </p>
        <Link to="/accesorios" className="btn btn-primary mt-3">
          Ir al catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="container my-5">
      <h2 className="fw-bold mb-4">Finalizar Compra</h2>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Columna Izquierda: Datos del Comprador, Entrega y Pago */}
          <div className="col-12">
            
            {/* 1. Datos Personales */}
            <div className="card mb-4 shadow-sm">
              <div className="card-header bg-white fw-bold">1. Datos Personales</div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombre y Apellido</label>
                    <input
                      type="text"
                      className="form-control"
                      value={usuario.nombre || usuario.email || ''}
                      disabled
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">DNI / CUIT</label>
                    <input
                      type="text"
                      name="dni"
                      className="form-control"
                      placeholder="Ej: 40123456"
                      value={formData.dni}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Número de celular</label>
                    <input
                      type="tel"
                      name="telefono"
                      className="form-control"
                      placeholder="Ej: 2664123456"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Método de Entrega */}
            <div className="card mb-4 shadow-sm">
              <div className="card-header bg-white fw-bold">2. Método de Entrega</div>
              <div className="card-body">
                <div className="form-check mb-2">
                  <input
                    type="radio"
                    id="domicilio"
                    name="tipoEntrega"
                    value="domicilio"
                    className="form-check-input"
                    checked={formData.tipoEntrega === 'domicilio'}
                    onChange={handleChange}
                  />
                  <label htmlFor="domicilio" className="form-check-label fw-semibold">
                    Envío a domicilio
                  </label>
                </div>

                <div className="form-check mb-3">
                  <input
                    type="radio"
                    id="retiro"
                    name="tipoEntrega"
                    value="retiro"
                    className="form-check-input"
                    checked={formData.tipoEntrega === 'retiro'}
                    onChange={handleChange}
                  />
                  <label htmlFor="retiro" className="form-check-label fw-semibold">
                    Retiro por la tienda (Gratis)
                  </label>
                </div>

                {/* Si elige domicilio se despliega la dirección */}
                {formData.tipoEntrega === 'domicilio' && (
                  <div className="mt-3">
                    <label className="form-label">Dirección de entrega</label>
                    <input
                      type="text"
                      name="direccion"
                      className="form-control"
                      placeholder="Calle, Número, Piso/Depto, Localidad"
                      value={formData.direccion}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 3. Método de Pago */}
            <div className="card mb-4 shadow-sm">
              <div className="card-header bg-white fw-bold">3. Método de Pago</div>
              <div className="card-body">
                <div className="d-flex gap-3 mb-3">
                  <div className="form-check">
                    <input
                      type="radio"
                      id="credito"
                      name="metodoPago"
                      value="credito"
                      className="form-check-input"
                      checked={formData.metodoPago === 'credito'}
                      onChange={handleChange}
                    />
                    <label htmlFor="credito" className="form-check-label">
                      Tarjeta de Crédito
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      type="radio"
                      id="debito"
                      name="metodoPago"
                      value="debito"
                      className="form-check-input"
                      checked={formData.metodoPago === 'debito'}
                      onChange={handleChange}
                    />
                    <label htmlFor="debito" className="form-check-label">
                      Tarjeta de Débito
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      type="radio"
                      id="mercadopago"
                      name="metodoPago"
                      value="mercadopago"
                      className="form-check-input"
                      checked={formData.metodoPago === 'mercadopago'}
                      onChange={handleChange}
                    />
                    <label htmlFor="mercadopago" className="form-check-label">
                      Mercado Pago
                    </label>
                  </div>
                </div>

                {/* Formulario de Tarjeta si elige Crédito o Débito */}
                {(formData.metodoPago === 'credito' || formData.metodoPago === 'debito') && (
                  <div className="border rounded p-3 bg-light mt-3">
                    <h6 className="fw-bold mb-3">Datos de la tarjeta</h6>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label small">Número de Tarjeta</label>
                        <input
                          type="text"
                          name="numeroTarjeta"
                          className="form-control"
                          placeholder="0000 0000 0000 0000"
                          value={formData.numeroTarjeta}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small">Nombre impreso en la tarjeta</label>
                        <input
                          type="text"
                          name="nombreTarjeta"
                          className="form-control"
                          placeholder="Como figura en la tarjeta"
                          value={formData.nombreTarjeta}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-6">
                        <label className="form-label small">Vencimiento (MM/AA)</label>
                        <input
                          type="text"
                          name="vencimiento"
                          className="form-control"
                          placeholder="MM/AA"
                          value={formData.vencimiento}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-6">
                        <label className="form-label small">Código CVV</label>
                        <input
                          type="password"
                          name="cvv"
                          maxLength="4"
                          className="form-control"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Aviso para Mercado Pago */}
                {formData.metodoPago === 'mercadopago' && (
                  <div className="alert alert-info mt-3 mb-0 small">
                    <i className="bi bi-info-circle me-1"></i> Serás redirigido a Mercado Pago para abonar de forma segura al confirmar la compra.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Resumen de Compra */}
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white fw-bold">Resumen del pedido</div>
              <div className="card-body">
                <ul className="list-group list-group-flush mb-3">
                  {carrito.map((item) => (
                    <li
                      key={`${item.id}-${item.talle}`}
                      className="list-group-item d-flex justify-content-between align-items-center px-0"
                    >
                      <div>
                        <h6 className="my-0 small fw-bold">{item.nombre}</h6>
                        <small className="text-muted">
                          Cant: {item.cantidad} {item.talle ? `| Talle: ${item.talle}` : ''}
                        </small>
                      </div>
                      <span className="text-muted small">
                        ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                      </span>
                    </li>
                  ))}
                </ul>

                <hr />

                <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
                  <span>Total:</span>
                  <span className="text-primary">
                    ${total.toLocaleString('es-AR')}
                  </span>
                </div>

                <button type="submit" className="btn btn-success btn-lg w-100">
                  Confirmar Compra
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default PantallaPago