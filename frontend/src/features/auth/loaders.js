import { redirect } from 'react-router'
import { obtenerSesion } from './authService'

export function protegerRuta(rolesPermitidos) {
  return () => {
    const sesion = obtenerSesion()
    if (!sesion) throw redirect('/login')
    if (!rolesPermitidos.includes(sesion.rol)) throw redirect('/gestor/pedidos')
    return sesion
  }
}

export function redirigirSiHaySesion() {
  const sesion = obtenerSesion()
  if (sesion) {
    throw redirect(sesion.rol === 'cliente' ? '/' : '/gestor')
  }
  return null
}