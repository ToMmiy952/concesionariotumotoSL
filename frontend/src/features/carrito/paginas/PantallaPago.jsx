import { useState } from 'react'
import { useNavigate, useOutletContext, Link } from 'react-router'
import { obtenerSesion } from '../../auth/authService'
import { pagarCarrito } from '../../vendedor/ventasService'
import { pesos } from '../../../shared/utils/formato'
import '../checkout.css'

const PASOS = ['Entrega', 'Pago', 'Confirmación']

const METODOS = [
  { id: 'credito', titulo: 'Crédito', detalle: 'Tarjeta', icono: 'bi-credit-card' },
  { id: 'debito', titulo: 'Débito', detalle: 'Tarjeta', icono: 'bi-credit-card-2-front' },
  { id: 'mercadopago', titulo: 'Mercado Pago', detalle: 'Tu cuenta', icono: 'bi-wallet2' },
]
const NOMBRE_METODO = { credito: 'Tarjeta de crédito', debito: 'Tarjeta de débito', mercadopago: 'Mercado Pago' }

// ---- Ayudas de formato y validación ----
const soloDigitos = texto => texto.replace(/\D/g, '')

// "4111111111111111" a "4111 1111 1111 1111"
const formatearNumeroTarjeta = texto => soloDigitos(texto).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')

// "1228" a "12/28"
function formatearVencimiento(texto) {
  const d = soloDigitos(texto).slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

function validarEntrega(f) {
  const errores = {}
  const dni = soloDigitos(f.dni)
  if (dni.length < 7 || dni.length > 11) errores.dni = 'Ingresá un DNI o CUIT válido (solo números).'
  const telefono = soloDigitos(f.telefono)
  if (telefono.length < 8 || telefono.length > 15) errores.telefono = 'Ingresá un celular válido (solo números).'
  if (f.tipoEntrega === 'domicilio' && f.direccion.trim().length < 5) errores.direccion = 'Ingresá la dirección completa de entrega.'
  return errores
}

function validarPago(p) {
  if (p.metodoPago === 'mercadopago') return {}
  const errores = {}
  const largo = soloDigitos(p.numeroTarjeta).length
  if (largo < 13 || largo > 19) errores.numeroTarjeta = 'El número de tarjeta no es válido.'
  if (p.nombreTarjeta.trim().length < 3) errores.nombreTarjeta = 'Ingresá el nombre como figura en la tarjeta.'

  const venc = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(p.vencimiento)
  if (!venc) {
    errores.vencimiento = 'Usá el formato MM/AA.'
  } else {
    // vence el último día del mes indicado
    const finDeMes = new Date(2000 + Number(venc[2]), Number(venc[1]), 0, 23, 59, 59)
    if (finDeMes < new Date()) errores.vencimiento = 'La tarjeta está vencida.'
  }
  if (!/^\d{3,4}$/.test(p.cvv)) errores.cvv = 'El código debe tener 3 o 4 números.'
  return errores
}

// ---- Piezas visuales ----
function BarraPasos({ paso }) {
  return (
    <ol className="checkout-pasos">
      {PASOS.map((nombre, i) => {
        const numero = i + 1
        const estado = numero < paso ? 'completo' : numero === paso ? 'activo' : ''
        return (
          <li key={nombre} className={`checkout-paso ${estado}`} aria-current={numero === paso ? 'step' : undefined}>
            <span className="checkout-paso-numero">
              {numero < paso ? <i className="bi bi-check-lg"></i> : numero}
            </span>
            {nombre}
          </li>
        )
      })}
    </ol>
  )
}

function TarjetaVirtual({ numero, nombre, vencimiento, tipo }) {
  // los dígitos que faltan se muestran como puntos: "4111 11•• •••• ••••"
  const numeroVisible = soloDigitos(numero || '').padEnd(16, '•').replace(/(.{4})(?=.)/g, '$1 ')
  return (
    <div className="tarjeta-virtual" aria-hidden="true">
      <div className="tarjeta-virtual-superior">
        <span>{tipo === 'debito' ? 'Débito' : 'Crédito'}</span>
        <span className="tarjeta-virtual-chip"></span>
      </div>
      <div className="tarjeta-virtual-numero">{numeroVisible}</div>
      <div className="tarjeta-virtual-inferior">
        <div className="tarjeta-virtual-nombre"><span>Titular</span>{nombre || 'Nombre y apellido'}</div>
        <div><span>Vence</span>{vencimiento || 'MM/AA'}</div>
      </div>
    </div>
  )
}

function ResumenPedido({ carrito, total, entrega }) {
  return (
    <div className="checkout-tarjeta checkout-resumen">
      <h3>Resumen del pedido</h3>
      {carrito.map(item => (
        <div key={`${item.id}-${item.talle}`} className="checkout-resumen-item">
          {item.imagen && <img src={item.imagen} alt={item.nombre} />}
          <div className="flex-grow-1">
            <div className="small fw-bold">{item.nombre}</div>
            <small className="text-muted">Cant: {item.cantidad}{item.talle ? ` | Talle: ${item.talle}` : ''}</small>
          </div>
          <span className="small fw-semibold">{pesos(item.precio * item.cantidad)}</span>
        </div>
      ))}
      <div className="d-flex justify-content-between small text-muted mt-3">
        <span>Entrega</span>
        <span>{entrega === 'domicilio' ? 'Envío a domicilio' : 'Retiro en la tienda'}</span>
      </div>
      <div className="d-flex justify-content-between fw-bold fs-5 mt-2">
        <span>Total</span>
        <span className="text-primary">{pesos(total)}</span>
      </div>
    </div>
  )
}

function MensajeError({ texto }) {
  return texto ? <div className="invalid-feedback d-block">{texto}</div> : null
}

// ---- Pasos ----
function PasoEntrega({ datos, errores, nombre, onCambio, onSiguiente }) {
  return (
    <form className="checkout-tarjeta" onSubmit={onSiguiente} noValidate>
      <h3><i className="bi bi-person-vcard me-2"></i>Tus datos y la entrega</h3>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label">Nombre y apellido</label>
          <input type="text" className="form-control" value={nombre} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="dni">DNI / CUIT</label>
          <input
            id="dni" name="dni" type="text" inputMode="numeric" placeholder="Ej: 40123456"
            className={`form-control ${errores.dni ? 'is-invalid' : ''}`} value={datos.dni} onChange={onCambio}
          />
          <MensajeError texto={errores.dni} />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="telefono">Número de celular</label>
          <input
            id="telefono" name="telefono" type="tel" inputMode="numeric" placeholder="Ej: 2664123456"
            className={`form-control ${errores.telefono ? 'is-invalid' : ''}`} value={datos.telefono} onChange={onCambio}
          />
          <MensajeError texto={errores.telefono} />
        </div>
      </div>

      <h6 className="fw-bold mb-3">¿Cómo querés recibirlo?</h6>
      <div className="checkout-opciones">
        {[
          { id: 'domicilio', titulo: 'Envío a domicilio', detalle: 'Lo llevamos a tu casa', icono: 'bi-truck' },
          { id: 'retiro', titulo: 'Retiro en la tienda', detalle: 'Sin costo', icono: 'bi-shop' },
        ].map(op => (
          <label key={op.id} className={`checkout-opcion ${datos.tipoEntrega === op.id ? 'elegida' : ''}`}>
            <input type="radio" name="tipoEntrega" value={op.id} checked={datos.tipoEntrega === op.id} onChange={onCambio} />
            <span className="icono"><i className={`bi ${op.icono}`}></i></span>
            <span className="fw-semibold">{op.titulo}<small>{op.detalle}</small></span>
          </label>
        ))}
      </div>

      {datos.tipoEntrega === 'domicilio' && (
        <div className="mt-3">
          <label className="form-label" htmlFor="direccion">Dirección de entrega</label>
          <input
            id="direccion" name="direccion" type="text" placeholder="Calle, número, piso/depto, localidad"
            className={`form-control ${errores.direccion ? 'is-invalid' : ''}`} value={datos.direccion} onChange={onCambio}
          />
          <MensajeError texto={errores.direccion} />
        </div>
      )}

      <div className="d-flex justify-content-between mt-4">
        <Link to="/accesorios" className="btn btn-outline-secondary"><i className="bi bi-arrow-left me-1"></i>Seguir comprando</Link>
        <button type="submit" className="btn btn-primary px-4">Continuar<i className="bi bi-arrow-right ms-1"></i></button>
      </div>
    </form>
  )
}

function PasoPago({ datos, errores, onCambio, onSiguiente, onVolver }) {
  const conTarjeta = datos.metodoPago !== 'mercadopago'
  return (
    <form className="checkout-tarjeta" onSubmit={onSiguiente} noValidate>
      <h3><i className="bi bi-credit-card me-2"></i>Método de pago</h3>

      {/* grilla que se adapta al ancho disponible: 3 en fila si entran, si no se acomodan solas */}
      <div className="checkout-opciones checkout-opciones-metodos mb-4">
        {METODOS.map(m => (
          <label key={m.id} className={`checkout-opcion vertical ${datos.metodoPago === m.id ? 'elegida' : ''}`}>
            <input type="radio" name="metodoPago" value={m.id} checked={datos.metodoPago === m.id} onChange={onCambio} />
            <span className="icono"><i className={`bi ${m.icono}`}></i></span>
            <span className="fw-semibold">{m.titulo}<small>{m.detalle}</small></span>
          </label>
        ))}
      </div>

      {conTarjeta ? (
        <div className="checkout-pago-grid">
          <div>
            <TarjetaVirtual
              numero={datos.numeroTarjeta} nombre={datos.nombreTarjeta}
              vencimiento={datos.vencimiento} tipo={datos.metodoPago}
            />
          </div>
          <div>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small" htmlFor="numeroTarjeta">Número de tarjeta</label>
                <input
                  id="numeroTarjeta" name="numeroTarjeta" type="text" inputMode="numeric" autoComplete="off"
                  placeholder="0000 0000 0000 0000"
                  className={`form-control ${errores.numeroTarjeta ? 'is-invalid' : ''}`}
                  value={datos.numeroTarjeta} onChange={onCambio}
                />
                <MensajeError texto={errores.numeroTarjeta} />
              </div>
              <div className="col-12">
                <label className="form-label small" htmlFor="nombreTarjeta">Nombre impreso en la tarjeta</label>
                <input
                  id="nombreTarjeta" name="nombreTarjeta" type="text" autoComplete="off" placeholder="Como figura en la tarjeta"
                  className={`form-control ${errores.nombreTarjeta ? 'is-invalid' : ''}`}
                  value={datos.nombreTarjeta} onChange={onCambio}
                />
                <MensajeError texto={errores.nombreTarjeta} />
              </div>
              <div className="col-6">
                <label className="form-label small" htmlFor="vencimiento">Vencimiento</label>
                <input
                  id="vencimiento" name="vencimiento" type="text" inputMode="numeric" autoComplete="off" placeholder="MM/AA"
                  className={`form-control ${errores.vencimiento ? 'is-invalid' : ''}`}
                  value={datos.vencimiento} onChange={onCambio}
                />
                <MensajeError texto={errores.vencimiento} />
              </div>
              <div className="col-6">
                <label className="form-label small" htmlFor="cvv">Código de seguridad</label>
                <input
                  id="cvv" name="cvv" type="password" inputMode="numeric" autoComplete="off" maxLength={4} placeholder="123"
                  className={`form-control ${errores.cvv ? 'is-invalid' : ''}`}
                  value={datos.cvv} onChange={onCambio}
                />
                <MensajeError texto={errores.cvv} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="checkout-mp">
          <i className="bi bi-wallet2"></i>
          <p className="fw-semibold mb-1">Vas a pagar con Mercado Pago</p>
          <p className="small mb-0">Al confirmar la compra se simula el pago con tu cuenta de Mercado Pago.</p>
        </div>
      )}

      <div className="alert alert-light border small mt-4 mb-0">
        <i className="bi bi-info-circle me-1"></i>
        Demostración: no se procesa ningún pago real. Los datos de la tarjeta no se envían ni se guardan.
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button type="button" className="btn btn-outline-secondary" onClick={onVolver}><i className="bi bi-arrow-left me-1"></i>Volver</button>
        <button type="submit" className="btn btn-primary px-4">Revisar compra<i className="bi bi-arrow-right ms-1"></i></button>
      </div>
    </form>
  )
}

function PasoRevision({ entrega, pago, total, error, enviando, onEditar, onVolver, onConfirmar }) {
  const ultimos4 = soloDigitos(pago.numeroTarjeta).slice(-4)
  const detallePago = pago.metodoPago === 'mercadopago' ? 'Con tu cuenta de Mercado Pago' : `Terminada en ${ultimos4}`
  return (
    <div className="checkout-tarjeta">
      <h3><i className="bi bi-clipboard-check me-2"></i>Revisá tu compra</h3>

      <div className="checkout-dato">
        <div>
          <strong>{entrega.tipoEntrega === 'domicilio' ? 'Envío a domicilio' : 'Retiro en la tienda'}</strong>
          <small>{entrega.tipoEntrega === 'domicilio' ? entrega.direccion : 'Retirás sin costo por la tienda'}</small>
          <small>DNI/CUIT {entrega.dni} · Cel. {entrega.telefono}</small>
        </div>
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onEditar(1)}>Editar</button>
      </div>

      <div className="checkout-dato">
        <div>
          <strong>{NOMBRE_METODO[pago.metodoPago]}</strong>
          <small>{detallePago}</small>
        </div>
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onEditar(2)}>Editar</button>
      </div>

      {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}

      <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
        <button type="button" className="btn btn-outline-secondary" onClick={onVolver} disabled={enviando}>
          <i className="bi bi-arrow-left me-1"></i>Volver
        </button>
        <button type="button" className="btn btn-success btn-lg px-4" onClick={onConfirmar} disabled={enviando}>
          {enviando ? 'Procesando...' : `Confirmar compra · ${pesos(total)}`}
        </button>
      </div>
    </div>
  )
}

// ---- Pantalla ----
function PantallaPago() {
  const navigate = useNavigate()
  const { carrito, compraRealizada } = useOutletContext()
  const usuario = obtenerSesion() || {}

  const [paso, setPaso] = useState(1) // 1 = entrega, 2 = pago, 3 = revisión
  const [errores, setErrores] = useState({})
  const [error, setError] = useState(null) // error de la API al confirmar
  const [enviando, setEnviando] = useState(false)
  const [entrega, setEntrega] = useState({ dni: '', telefono: '', tipoEntrega: 'domicilio', direccion: '' })
  // Estos datos solo viven en esta pantalla: nunca se mandan a la API
  const [pago, setPago] = useState({ metodoPago: 'credito', numeroTarjeta: '', nombreTarjeta: '', vencimiento: '', cvv: '' })

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

  function irAlPaso(nuevo) {
    setErrores({})
    setError(null)
    setPaso(nuevo)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cambiarEntrega(e) {
    const { name, value } = e.target
    const limpio = name === 'dni' || name === 'telefono' ? soloDigitos(value) : value
    setEntrega(prev => ({ ...prev, [name]: limpio }))
    setErrores(prev => ({ ...prev, [name]: undefined }))
  }

  function cambiarPago(e) {
    const { name, value } = e.target
    let limpio = value
    if (name === 'numeroTarjeta') limpio = formatearNumeroTarjeta(value)
    if (name === 'vencimiento') limpio = formatearVencimiento(value)
    if (name === 'cvv') limpio = soloDigitos(value).slice(0, 4)
    setPago(prev => ({ ...prev, [name]: limpio }))
    setErrores(prev => ({ ...prev, [name]: undefined }))
  }

  // Pasa de un paso al siguiente solo si lo cargado en el paso actual es válido
  function siguienteDeEntrega(e) {
    e.preventDefault()
    const encontrados = validarEntrega(entrega)
    if (Object.keys(encontrados).length > 0) return setErrores(encontrados)
    irAlPaso(2)
  }

  function siguienteDePago(e) {
    e.preventDefault()
    const encontrados = validarPago(pago)
    if (Object.keys(encontrados).length > 0) return setErrores(encontrados)
    irAlPaso(3)
  }

  // Confirma la compra: POST /ventas/online con SOLO el método de pago y la entrega (nunca la tarjeta)
  async function confirmar() {
    setError(null)
    setEnviando(true)
    const r = await pagarCarrito({
      metodoPago: pago.metodoPago,
      tipoEntrega: entrega.tipoEntrega,
      direccion: entrega.direccion.trim(),
    })
    setEnviando(false)
    if (!r.ok) {
      // el carrito o el stock pueden haber cambiado desde otra pestaña: se vuelve a leer lo real de la base.
      // Si quedó vacío, la pantalla pasa sola al aviso "No hay productos en el carrito"
      await compraRealizada()
      return setError(r.error)
    }

    // primero se va a la pantalla de éxito y después se refresca el carrito: si fuera al revés, por un instante
    // se vería el aviso "No hay productos en el carrito" (el carrito ya quedó vacío en la base)
    navigate('/compra-exitosa', { state: { venta: r.venta }, replace: true })
    compraRealizada()
  }

  if (carrito.length === 0) {
    return (
      <div className="container my-5 text-center">
        <h2>No hay productos en el carrito</h2>
        <p className="text-secondary">Agregá accesorios desde el catálogo antes de finalizar la compra.</p>
        <Link to="/accesorios" className="btn btn-primary mt-3">Ir al catálogo</Link>
      </div>
    )
  }

  return (
    <div className="container checkout-ancho my-5">
      <h2 className="fw-bold mb-4 text-center">Finalizar compra</h2>
      <BarraPasos paso={paso} />

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          {paso === 1 && (
            <PasoEntrega
              datos={entrega} errores={errores} nombre={usuario.nombre || usuario.email || ''}
              onCambio={cambiarEntrega} onSiguiente={siguienteDeEntrega}
            />
          )}
          {paso === 2 && (
            <PasoPago
              datos={pago} errores={errores} onCambio={cambiarPago}
              onSiguiente={siguienteDePago} onVolver={() => irAlPaso(1)}
            />
          )}
          {paso === 3 && (
            <PasoRevision
              entrega={entrega} pago={pago} total={total} error={error} enviando={enviando}
              onEditar={irAlPaso} onVolver={() => irAlPaso(2)} onConfirmar={confirmar}
            />
          )}
        </div>
        <div className="col-12 col-xl-4">
          <ResumenPedido carrito={carrito} total={total} entrega={entrega.tipoEntrega} />
        </div>
      </div>
    </div>
  )
}

export default PantallaPago
