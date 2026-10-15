import { redirect } from 'react-router'
import { obtenerSesion, rutaInicial } from './authService'

export function protegerRuta(rolesPermitidos) {
  return ({ request }) => {
    const sesion = obtenerSesion()
    if (!sesion) {
      // recordamos a dónde quería ir
      const destino = new URL(request.url).pathname
      throw redirect(`/login?destino=${encodeURIComponent(destino)}`)
    }
    if (!rolesPermitidos.includes(sesion.rol)) throw redirect(rutaInicial(sesion.rol))
    return sesion
  }
}

export function redirigirSiHaySesion() {
  const sesion = obtenerSesion()
  if (sesion) throw redirect(rutaInicial(sesion.rol))
  return null
}