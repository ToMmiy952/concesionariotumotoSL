import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { login, rutaInicial } from './authService'
import '../../shared/styles/gestor.css'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function manejarSubmit(e) {
    e.preventDefault()
    const sesion = login(email, password)
    if (!sesion) {
      setError('Email o contraseña incorrectos')
      return
    }
    navigate(rutaInicial(sesion.rol))
  }

  return (
    <div className="login-pagina">
      <form onSubmit={manejarSubmit}>
        <img src="/logo.jpg" alt="Logo" className="logo" />
        <h2 className="text-center">Ingresar</h2>

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
        <Link to="/" className="text-center">Volver al sitio</Link>
      </form>
    </div>
  )
}
export default LoginPage