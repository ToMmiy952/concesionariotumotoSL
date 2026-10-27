const CLAVE = 'sesion'
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

// POST JSON a la API; devuelve { ok, status, data } y nunca lanza (sin conexión, ok es false con un mensaje)
async function post(ruta, cuerpo) {
  try {
    const res = await fetch(`${API_URL}${ruta}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, status: res.status, data }
  } catch {
    return { ok: false, status: 0, data: { error: 'No se pudo conectar con el servidor. Intentá de nuevo más tarde.' } }
  }
}

// Devuelve { ok: true, sesion } o { ok: false, error }
export async function login(email, password) {
  const r = await post('/auth/login', { email, password })
  if (!r.ok) return { ok: false, error: r.status === 401 ? 'Email o contraseña incorrectos' : r.data.error }

  const { usuario, token } = r.data
  // el resto de la app usa el rol en minúscula y el id como "id"
  const sesion = { id: usuario.id_usuario, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol.toLowerCase(), token }
  sessionStorage.setItem(CLAVE, JSON.stringify(sesion))
  return { ok: true, sesion }
}

// Crea una cuenta de cliente en la base de datos. Devuelve { ok: true } o { ok: false, error }
export async function registrar(datos) {
  const r = await post('/auth/registro', datos)
  return r.ok ? { ok: true } : { ok: false, error: r.data.error }
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
