import { useEffect } from 'react'

// Ventana de confirmación del gestor: reemplaza al confirm() nativo del navegador.
// Se controla desde afuera: abierto, onConfirmar y onCancelar. El contenido va como children.
function ModalConfirmar({
  abierto,
  titulo,
  icono = 'bi-question-circle',
  variante = 'primary', // color del ícono y del botón: primary, danger, success...
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  procesando = false,
  onConfirmar,
  onCancelar,
  children,
}) {
  // Escape cierra el modal (salvo que haya una operación en curso)
  useEffect(() => {
    if (!abierto) return
    const alTeclear = e => { if (e.key === 'Escape' && !procesando) onCancelar() }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [abierto, procesando, onCancelar])

  if (!abierto) return null

  return (
    <div
      className="modal-confirmar-fondo"
      onClick={() => { if (!procesando) onCancelar() }}
    >
      <div
        className="modal-confirmar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-confirmar-titulo"
        onClick={e => e.stopPropagation()}
      >
        <div className={`modal-confirmar-icono text-bg-${variante}`}>
          <i className={`bi ${icono}`}></i>
        </div>
        <h3 id="modal-confirmar-titulo">{titulo}</h3>
        <div className="modal-confirmar-cuerpo">{children}</div>
        <div className="modal-confirmar-acciones">
          <button type="button" className="btn btn-outline-secondary" onClick={onCancelar} disabled={procesando}>
            {textoCancelar}
          </button>
          <button type="button" className={`btn btn-${variante}`} onClick={onConfirmar} disabled={procesando}>
            {procesando ? 'Procesando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalConfirmar
