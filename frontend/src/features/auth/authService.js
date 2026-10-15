import usuarios from '../../../../backend/data/usuarios.json'

const CLAVE = 'sesion'

export function login(email, password) {
  const usuario = usuarios.find(u => u.email === email && u.password === password)
  if (!usuario) return null
  const sesion = { ...usuario }
  delete sesion.password // no guardamos la contraseña en la sesión
  sessionStorage.setItem(CLAVE, JSON.stringify(sesion))
  return sesion
}

export function logout() {
  sessionStorage.removeItem(CLAVE)
}

export function obtenerSesion() {
  const sesion = sessionStorage.getItem(CLAVE)
  return sesion ? JSON.parse(sesion) : null
}

export function rutaInicial(rol) {
  if (rol === 'administrador') return '/gestor'
  if (rol === 'vendedor') return '/gestor/pedidos'
  if (rol === 'cliente') return '/'
  return '/'
}