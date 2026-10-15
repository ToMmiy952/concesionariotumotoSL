import { Outlet, NavLink, useLoaderData, useNavigate } from 'react-router'
import { logout } from '../../features/auth/authService'
import '../styles/gestor.css'

function LayoutGestor() {
  const sesion = useLoaderData()
  const navigate = useNavigate()

  function cerrarSesion() {
    logout()
    navigate('/login')
  }

  return (
    <div className="gestor">
      <aside className="gestor-sidebar">
        <div className="marca">
          <img src="/logo.jpg" alt="Logo" className="logo" />
          <h1>TuMotoSL</h1>
        </div>
        <nav className="nav flex-column gap-1">
          {sesion.rol === 'administrador' && (
            <>
              <NavLink className="nav-link" to="/gestor" end><i className="bi bi-speedometer2 me-2"></i>Panel</NavLink>
              <NavLink className="nav-link" to="/gestor/productos"><i className="bi bi-bicycle me-2"></i>Motos</NavLink>
            </>
          )}
          <NavLink className="nav-link" to="/gestor/pedidos"><i className="bi bi-inbox me-2"></i>Pedidos</NavLink>
          <NavLink className="nav-link" to="/gestor/stock"><i className="bi bi-box-seam me-2"></i>Stock</NavLink>
          {sesion.rol === 'vendedor' && (
            <NavLink className="nav-link" to="/gestor/comisiones"><i className="bi bi-percent me-2"></i>Comisiones</NavLink>
          )}
        </nav>
      </aside>

      <div className="gestor-contenido">
        <header className="gestor-topbar">
          <span><i className="bi bi-person-circle me-2"></i>{sesion.nombre}</span>
          <button className="btn btn-sm btn-light" onClick={cerrarSesion}>
            <i className="bi bi-box-arrow-right me-1"></i>Cerrar sesión
          </button>
        </header>
        <main><Outlet /></main>
      </div>
    </div>
  )
}
export default LayoutGestor