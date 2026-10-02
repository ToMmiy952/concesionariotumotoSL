import usuarios from '../../../../backend/data/usuarios.json'

const CLAVE = 'sesion'

export function login(email, password) {
  const usuario = usuarios.find(u => u.email === email && u.password === password)
  if (!usuario) return null
  const sesion = { ...usuario }
  delete sesion.password // no guardamos la contraseña en localStorage
  localStorage.setItem(CLAVE, JSON.stringify(sesion))
  return sesion
}

export function logout() {
  localStorage.removeItem(CLAVE)
}

export function obtenerSesion() {
    const sesion = localStorage.getItem(CLAVE)
    return sesion ? JSON.parse(sesion) : null
}

export function rutaInicial(rol) {
  if (rol === 'administrador') return '/gestor'
  if (rol === 'vendedor') return '/gestor/pedidos'
  return '/'
}