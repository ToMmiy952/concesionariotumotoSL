function Carrito({ abierto, onCerrar }) {
  return (
    <>     
      {abierto && (
        <div
          className="modal-backdrop fade show"
          onClick={onCerrar}
          style={{ zIndex: 1040 }}
        />
      )}
    
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
          <h5 className="offcanvas-title fw-bold">Carrito</h5>
          <button
            type="button"
            className="btn-close"
            aria-label="Cerrar"
            onClick={onCerrar}
          />
        </div>

        <div className="offcanvas-body">
          <p className="text-secondary text-center mt-3">
            Tu carrito está vacío por el momento.
          </p>
        </div>
      </div>
    </>
  );
}

export default Carrito;