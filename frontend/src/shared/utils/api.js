export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'
export const CLAVE_SESION = 'sesion'

// Token JWT de la sesión guardada al hacer login (null si no hay sesión)
export function obtenerToken() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_SESION))?.token ?? null
  } catch {
    return null
  }
}

// Mensaje para el usuario según el código de respuesta de la API
export function mensajeDeError({ status, data }) {
  if (status === 401) return 'Tu sesión expiró o no iniciaste sesión. Volvé a iniciar sesión.'
  if (status === 403) return 'No tenés permisos para realizar esta acción.'
  return data?.error ?? 'Ocurrió un error inesperado. Intentá de nuevo.'
}

// fetch contra la API: agrega la URL base y, si hay sesión, la cabecera Authorization: Bearer <token>
export function apiFetch(ruta, opciones = {}) {
  const headers = { ...opciones.headers }
  if (opciones.body !== undefined) headers['Content-Type'] ??= 'application/json'

  const token = obtenerToken()
  if (token) headers.Authorization = `Bearer ${token}`

  return fetch(`${API_URL}${ruta}`, { ...opciones, headers })
}

// Igual que apiFetch pero devuelve { ok, status, data } y nunca lanza (sin conexión, ok es false con un mensaje)
export async function apiJson(ruta, opciones) {
  try {
    const res = await apiFetch(ruta, opciones)
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, status: res.status, data }
  } catch {
    return { ok: false, status: 0, data: { error: 'No se pudo conectar con el servidor. Intentá de nuevo más tarde.' } }
  }
}
