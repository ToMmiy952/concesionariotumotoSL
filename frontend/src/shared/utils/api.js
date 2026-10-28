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

// fetch contra la API: agrega la URL base y, si hay sesión, la cabecera Authorization: Bearer <token>
export function apiFetch(ruta, opciones = {}) {
  const headers = { ...opciones.headers }
  if (opciones.body !== undefined) headers['Content-Type'] ??= 'application/json'

  const token = obtenerToken()
  if (token) headers.Authorization = `Bearer ${token}`

  return fetch(`${API_URL}${ruta}`, { ...opciones, headers })
}
