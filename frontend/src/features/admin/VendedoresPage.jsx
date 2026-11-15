import { useEffect, useState } from 'react'
import { listarVendedores, crearVendedor, cambiarActivoVendedor } from './vendedoresService'
import ModalConfirmar from '../../shared/components/ModalConfirmar'

const FORM_VACIO = { nombre: '', email: '', password: '' }

// "2024-01-15T00:00:00.000Z" a "15/01/2024" (la API manda la fecha de contratación sin hora)
const fechaCorta = iso => new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('es-AR')

function VendedoresPage() {
  const [vendedores, setVendedores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null) // error al cargar la lista
  const [aviso, setAviso] = useState(null) // resultado de la última acción: { tipo, texto }
  const [recarga, setRecarga] = useState(0) // cambiar este número vuelve a pedir la lista
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)
  const [errorForm, setErrorForm] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [pendiente, setPendiente] = useState(null) // vendedor cuya baja o reactivación espera confirmación
  const [procesando, setProcesando] = useState(false)

  useEffect(() => {
    let cancelado = false
    async function cargar() {
      const r = await listarVendedores()
      if (cancelado) return
      if (r.ok) {
        setVendedores(r.vendedores)
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

  function cambiarCampo(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function guardar(e) {
    e.preventDefault()
    setErrorForm(null)
    if (!form.nombre.trim() || !form.email.trim() || !form.password) {
      return setErrorForm('Completá nombre, email y contraseña.')
    }
    if (form.password.length < 6) {
      return setErrorForm('La contraseña debe tener al menos 6 caracteres.')
    }

    setGuardando(true)
    const r = await crearVendedor({ nombre: form.nombre.trim(), email: form.email.trim(), password: form.password })
    setGuardando(false)
    if (!r.ok) return setErrorForm(r.error)

    setAviso({ tipo: 'success', texto: `Se dio de alta a ${r.vendedor.nombre}. Ya puede iniciar sesión.` })
    setForm(FORM_VACIO)
    setMostrarForm(false)
    setRecarga(n => n + 1)
  }

  async function confirmarCambio() {
    const v = pendiente
    const activar = !v.esta_activo
    setProcesando(true)
    setAviso(null)
    const r = await cambiarActivoVendedor(v.id_usuario, activar)
    setProcesando(false)
    setPendiente(null)
    setAviso(r.ok
      ? { tipo: 'success', texto: activar ? `${v.nombre} fue reactivado.` : `${v.nombre} fue dado de baja y ya no puede iniciar sesión.` }
      : { tipo: 'danger', texto: r.error })
    setRecarga(n => n + 1) // releemos la lista para ver el estado real
  }

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Vendedores</h2>
        <button className="btn btn-primary" onClick={() => { setMostrarForm(m => !m); setErrorForm(null) }}>
          <i className={`bi ${mostrarForm ? 'bi-x-lg' : 'bi-person-plus'} me-1`}></i>
          {mostrarForm ? 'Cerrar' : 'Nuevo vendedor'}
        </button>
      </div>

      {mostrarForm && (
        <form className="tarjeta-tabla mb-3" onSubmit={guardar} noValidate>
          <h3 className="h5 mb-3">Alta de vendedor</h3>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="vend-nombre">Nombre</label>
              <input id="vend-nombre" name="nombre" className="form-control" value={form.nombre} onChange={cambiarCampo} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="vend-email">Email</label>
              <input id="vend-email" name="email" type="email" className="form-control" value={form.email} onChange={cambiarCampo} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="vend-password">Contraseña</label>
              <input
                id="vend-password" name="password" type="password" className="form-control"
                autoComplete="new-password" value={form.password} onChange={cambiarCampo}
              />
              <div className="form-text">Mínimo 6 caracteres. Se la pasás al vendedor para que ingrese.</div>
            </div>
          </div>
          {errorForm && <div className="alert alert-danger mt-3 mb-0" role="alert">{errorForm}</div>}
          <div className="mt-3">
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Dar de alta'}
            </button>
          </div>
        </form>
      )}

      {cargando && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-secondary">Cargando vendedores...</p>
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

          {vendedores.length === 0 && (
            <div className="alert alert-light border">Todavía no hay vendedores cargados.</div>
          )}

          {vendedores.length > 0 && (
            <div className="tarjeta-tabla">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Contratación</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendedores.map(v => (
                      <tr key={v.id_usuario}>
                        <td>{v.nombre}</td>
                        <td>{v.email}</td>
                        <td>{fechaCorta(v.fecha_contratacion)}</td>
                        <td>
                          <span className={`badge ${v.esta_activo ? 'text-bg-success' : 'text-bg-secondary'}`}>
                            {v.esta_activo ? 'Activo' : 'De baja'}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            className={`btn btn-sm ${v.esta_activo ? 'btn-outline-danger' : 'btn-outline-success'}`}
                            onClick={() => setPendiente(v)}
                          >
                            <i className={`bi ${v.esta_activo ? 'bi-person-dash' : 'bi-person-check'} me-1`}></i>
                            {v.esta_activo ? 'Dar de baja' : 'Reactivar'}
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

      {/* El modal es un componente aparte: así este componente no lee propiedades de `pendiente` (que puede ser null) */}
      {pendiente && (
        <ModalCambioVendedor
          vendedor={pendiente}
          procesando={procesando}
          onConfirmar={confirmarCambio}
          onCancelar={() => setPendiente(null)}
        />
      )}
    </section>
  )
}

// Confirmación de baja o reactivación. Solo se monta cuando hay un vendedor elegido
function ModalCambioVendedor({ vendedor, procesando, onConfirmar, onCancelar }) {
  const baja = vendedor.esta_activo
  return (
    <ModalConfirmar
      abierto
      titulo={baja ? 'Dar de baja vendedor' : 'Reactivar vendedor'}
      icono={baja ? 'bi-person-dash' : 'bi-person-check'}
      variante={baja ? 'danger' : 'success'}
      textoConfirmar={baja ? 'Dar de baja' : 'Reactivar'}
      procesando={procesando}
      onConfirmar={onConfirmar}
      onCancelar={onCancelar}
    >
      {baja ? (
        <p className="mb-0"><strong>{vendedor.nombre}</strong> ya no va a poder iniciar sesión. Se conserva su historial de ventas y comisiones, y podés reactivarlo cuando quieras.</p>
      ) : (
        <p className="mb-0"><strong>{vendedor.nombre}</strong> va a poder volver a iniciar sesión.</p>
      )}
    </ModalConfirmar>
  )
}

export default VendedoresPage
