import { redirect } from 'react-router'
import { obtenerSesion, rutaInicial } from './authService'

export function protegerRuta(rolesPermitidos) {
  return () => {
    const sesion = obtenerSesion()
    if (!sesion) throw redirect('/login')
    if (!rolesPermitidos.includes(sesion.rol)) throw redirect(rutaInicial(sesion.rol))
    return sesion
  }
}

export function redirigirSiHaySesion() {
  const sesion = obtenerSesion()
  if (sesion) throw redirect(rutaInicial(sesion.rol))
  return null
}