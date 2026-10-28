import { apiJson, mensajeDeError } from '../../shared/utils/api'

// Estados que maneja la API
export const ESTADOS = ['vigente', 'concretada', 'vencida', 'cancelada']
export const ETIQUETA_ESTADO = { vigente: 'Vigente', concretada: 'Concretada', vencida: 'Vencida', cancelada: 'Cancelada' }

const HORARIOS = { manana: 'Mañana', tarde: 'Tarde', noche: 'Noche' }

// Todas las funciones devuelven { ok: true, ... } o { ok: false, error }

// Reserva una cita por 48 hs. Es pública: no requiere sesión
export async function crearReserva(idMoto, datos) {
  const r = await apiJson('/reservas', {
    method: 'POST',
    body: JSON.stringify({
      idMoto: Number(idMoto),
      nombre_interesado: datos.nombre.trim(),
      email_interesado: datos.email.trim(),
      telefono_interesado: datos.telefono.trim(),
      horario_preferido: [datos.fecha, HORARIOS[datos.horario]].filter(Boolean).join(' · '),
      comentarios: datos.comentario.trim() || undefined,
    }),
  })
  return r.ok ? { ok: true, reserva: r.data.reserva } : { ok: false, error: mensajeDeError(r) }
}

// Lista las reservas (vendedor o admin: requiere token)
export async function listarReservas() {
  const r = await apiJson('/reservas')
  return r.ok ? { ok: true, reservas: r.data } : { ok: false, error: mensajeDeError(r) }
}

export async function cambiarEstadoReserva(id, estado) {
  const r = await apiJson(`/reservas/${id}`, { method: 'PATCH', body: JSON.stringify({ estado_reserva: estado }) })
  return r.ok ? { ok: true } : { ok: false, error: mensajeDeError(r) }
}

// Registra la venta presencial de la moto reservada (solo vendedor). La API marca la reserva como concretada
export async function concretarVenta(idMoto, idReserva) {
  const r = await apiJson('/ventas/motos', { method: 'POST', body: JSON.stringify({ idMoto, idReserva }) })
  return r.ok ? { ok: true, venta: r.data } : { ok: false, error: mensajeDeError(r) }
}

// Cantidad de reservas vigentes (para el panel del admin); null si no se pudo obtener
export async function contarReservasVigentes() {
  const r = await listarReservas()
  return r.ok ? r.reservas.filter(x => x.estado_reserva === 'vigente').length : null
}
