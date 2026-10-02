const CLAVE = 'consultas'

export const ESTADOS = ['Pendiente', 'Contactado', 'En trámite', 'Entregado', 'Cerrado']

export function obtenerConsultas() {
  const guardadas = JSON.parse(localStorage.getItem(CLAVE)) || []
  const completas = guardadas.map((c, i) => ({
    ...c,
    id: c.id ?? `${Date.now()}-${i}`,
    estado: c.estado ?? 'Pendiente',
    notas: c.notas ?? '',
  }))
  localStorage.setItem(CLAVE, JSON.stringify(completas))
  return completas
}

export function actualizarConsulta(id, cambios) {
  const nuevas = obtenerConsultas().map(c => (c.id === id ? { ...c, ...cambios } : c))
  localStorage.setItem(CLAVE, JSON.stringify(nuevas))
}
