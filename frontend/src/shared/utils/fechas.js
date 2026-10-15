// Fechas en hora local (toISOString() devuelve UTC y cerca de la medianoche cambia el día)
function dosDigitos(n) {
  return String(n).padStart(2, '0')
}

export function hoyLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`
}

export function horaLocal() {
  const d = new Date()
  return `${dosDigitos(d.getHours())}:${dosDigitos(d.getMinutes())}`
}

export function mesActual() {
  return hoyLocal().slice(0, 7) // "2026-10"
}

export function formatearFechaHora(iso) {
  return new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}
