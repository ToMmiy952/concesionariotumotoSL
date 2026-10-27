import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { registrar } from './authService'
import '../../shared/styles/gestor.css'

const VACIO = {
  nombre: '', email: '', password: '', confirmar: '',
  telefono: '', direccion: '', cod_postal: '', provincia: '',
}

function RegistroPage() {
  const [datos, setDatos] = useState(VACIO)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navigate = useNavigate()

  const cambiar = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.value })

  async function manejarSubmit(e) {
    e.preventDefault()
    setError('')

    if (datos.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres')
    if (datos.password !== datos.confirmar) return setError('Las contraseñas no coinciden')
    if (datos.cod_postal && !/^\d{1,5}$/.test(datos.cod_postal)) return setError('El código postal debe ser numérico')

    setEnviando(true)
    const reg = await registrar({
      nombre: datos.nombre.trim(),
      email: datos.email.trim(),
      password: datos.password,
      telefono: datos.telefono.trim() || undefined,
      direccion: datos.direccion.trim() || undefined,
      cod_postal: datos.cod_postal ? Number(datos.cod_postal) : undefined,
      provincia: datos.provincia.trim() || undefined,
    })
    setEnviando(false)
    if (!reg.ok) return setError(reg.error)

    // cuenta creada en la BD: mandamos al login con un aviso
    navigate('/login', { state: { registrado: true, email: datos.email.trim() } })
  }

  return (
    <div className="login-pagina">
      <form onSubmit={manejarSubmit}>
        <img src="/logo.jpg" alt="Logo" className="logo" />
        <h2 className="text-center">Crear cuenta</h2>

        <div>
          <label className="form-label" htmlFor="nombre">Nombre y apellido</label>
          <input id="nombre" className="form-control" value={datos.nombre} onChange={cambiar('nombre')} required />
        </div>
        <div>
          <label className="form-label" htmlFor="email">Email</label>
          <input id="email" className="form-control" type="email" value={datos.email} onChange={cambiar('email')} required />
        </div>
        <div>
          <label className="form-label" htmlFor="password">Contraseña</label>
          <input id="password" className="form-control" type="password" value={datos.password}
                 onChange={cambiar('password')} minLength={6} required />
        </div>
        <div>
          <label className="form-label" htmlFor="confirmar">Repetir contraseña</label>
          <input id="confirmar" className="form-control" type="password" value={datos.confirmar}
                 onChange={cambiar('confirmar')} required />
        </div>
        <div>
          <label className="form-label" htmlFor="telefono">Teléfono (opcional)</label>
          <input id="telefono" className="form-control" type="tel" value={datos.telefono} onChange={cambiar('telefono')} />
        </div>
        <div>
          <label className="form-label" htmlFor="direccion">Dirección (opcional)</label>
          <input id="direccion" className="form-control" value={datos.direccion} onChange={cambiar('direccion')} />
        </div>
        <div>
          <label className="form-label" htmlFor="cod_postal">Código postal (opcional)</label>
          <input id="cod_postal" className="form-control" inputMode="numeric" value={datos.cod_postal}
                 onChange={cambiar('cod_postal')} />
        </div>
        <div>
          <label className="form-label" htmlFor="provincia">Provincia (opcional)</label>
          <input id="provincia" className="form-control" value={datos.provincia} onChange={cambiar('provincia')} />
        </div>

        {error && <div className="alert alert-danger py-2 mb-0">{error}</div>}

        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Creando cuenta...' : 'Registrarme'}
        </button>
        <Link to="/login" className="text-center">¿Ya tenés cuenta? Iniciá sesión</Link>
      </form>
    </div>
  )
}
export default RegistroPage
