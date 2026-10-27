import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { login, rutaInicial } from './authService'
import '../../shared/styles/gestor.css'

function LoginPage() {
  const { state } = useLocation()
  // si venimos del registro, dejamos el email cargado y avisamos que la cuenta ya se creó
  const [email, setEmail] = useState(state?.email ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function manejarSubmit(e) {
    e.preventDefault()
    setError('')
    const resultado = await login(email, password)
    if (!resultado.ok) {
      setError(resultado.error)
      return
    }
    navigate(rutaInicial(resultado.sesion.rol))
  }

  return (
    <div className="login-pagina">
      <form onSubmit={manejarSubmit}>
        <img src="/logo.jpg" alt="Logo" className="logo" />
        <h2 className="text-center">Ingresar</h2>

        {state?.registrado && (
          <div className="alert alert-success py-2 mb-0">Cuenta creada con éxito. Iniciá sesión para continuar.</div>
        )}

        <div>
          <label className="form-label" htmlFor="email">Email</label>
          <input id="email" className="form-control" type="email" value={email}
                 onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="form-label" htmlFor="password">Contraseña</label>
          <input id="password" className="form-control" type="password" value={password}
                 onChange={e => setPassword(e.target.value)} required />
        </div>

        {error && <div className="alert alert-danger py-2 mb-0">{error}</div>}

        <button type="submit" className="btn btn-primary">Entrar</button>
        <Link to="/registro" className="text-center">¿No tenés cuenta? Registrate</Link>
        <Link to="/" className="text-center">Volver al sitio</Link>
      </form>
    </div>
  )
}
export default LoginPage