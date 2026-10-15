function Carrito({ abierto, onCerrar, carrito, eliminarProducto, cambiarCantidad, vaciarCarrito, onComprar }) {

  const totalPrecio = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const totalFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(totalPrecio);


  return (
    <>
      {abierto && (
        <div
          className="modal-backdrop fade show"
          onClick={onCerrar}
          style={{ zIndex: 1040 }}
        />
      )}

      {/* Offcanvas desplegable del carrito */}
      <div
        className={`offcanvas offcanvas-end ${abierto ? 'show' : ''}`}
        tabIndex="-1"
        style={{
          visibility: abierto ? 'visible' : 'hidden',
          width: '33.33vw',
          minWidth: '320px',
          zIndex: 1045
        }}
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title fw-bold">Mi Carrito</h5>
          <button
            type="button"
            className="btn-close"
            aria-label="Cerrar"
            onClick={onCerrar}
          />
        </div>

        <div className="offcanvas-body d-flex flex-column justify-content-between">
          {carrito.length === 0 ? (
            <p className="text-secondary text-center mt-3">
              Tu carrito está vacío por el momento.
            </p>
          ) : (
            <>
              {/* Lista de productos agregados */}
              <div className="list-group list-group-flush mb-3 overflow-auto">
                {carrito.map((item, index) => {
                  const precioItemFormateado = new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    maximumFractionDigits: 0
                  }).format(item.precio * item.cantidad);

                  return (
                    <div
                      key={`${item.id}-${item.talle || index}`}
                      className="list-group-item d-flex align-items-center justify-content-between py-3 px-0 border-bottom"
                    >
                      <div className="d-flex align-items-center gap-3">
                        {item.imagen && (
                          <img
                            src={item.imagen}
                            alt={item.nombre}
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'contain'
                            }}
                          />
                        )}
                        <div>
                          <h6 className="mb-0 fw-bold">{item.nombre}</h6>
                          {item.talle && (
                            <small className="text-muted d-block">
                              Talle: {item.talle}
                            </small>
                          )}
                          <small className="text-secondary d-block">
                            ${item.precio.toLocaleString('es-AR')} c/u
                          </small>
                          <div className="d-flex align-items-center gap-2 mt-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary py-0 px-2"
                              aria-label="Restar una unidad"
                              disabled={item.cantidad <= 1}
                              onClick={() => cambiarCantidad(item.id, item.talle, -1)}
                            >
                              <i className="bi bi-dash"></i>
                            </button>
                            <span>{item.cantidad}</span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary py-0 px-2"
                              aria-label="Sumar una unidad"
                              onClick={() => cambiarCantidad(item.id, item.talle, 1)}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="text-end">
                        <span className="fw-bold d-block text-primary mb-1">
                          {precioItemFormateado}
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger border-0 p-1"
                          title="Eliminar del carrito"
                          onClick={() => eliminarProducto(item.id, item.talle)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pie con Totales y Botones de Acción */}
              <div className="border-top pt-3 mt-auto">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fs-5 fw-bold">Total:</span>
                  <span className="fs-4 fw-bold text-primary">
                    {totalFormateado}
                  </span>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-50"
                    onClick={vaciarCarrito}
                  >
                    Vaciar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary w-50"
                    onClick={onComprar}
                  >
                    Comprar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Carrito;