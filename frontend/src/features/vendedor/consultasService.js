import { obtenerMoto, setEstadoMoto } from '../admin/productosService'

const CLAVE = 'consultas'

export const ESTADOS = ['Pendiente', 'Contactado', 'En trámite', 'Entregado', 'Cerrado', 'Vencida']
// mientras la reserva está en alguno de estos estados, la moto figura como "Reservada"
export const ESTADOS_ABIERTOS = ['Pendiente', 'Contactado', 'En trámite']
export const HORAS_RESERVA = 48

function leer() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) || []
  } catch {
    return []
  }
}

function guardar(consultas) {
  localStorage.setItem(CLAVE, JSON.stringify(consultas))
}

// Deja la moto "Reservada" si tiene reservas abiertas y "Disponible" si ya no (respeta Agotado y otros estados)
function sincronizarEstadoMoto(idMoto, consultas) {
  const moto = obtenerMoto(idMoto)
  if (!moto || moto.stock === 0) return
  if (moto.estado !== 'Disponible' && moto.estado !== 'Reservada') return
  const hayReservaAbierta = consultas.some(
    c => Number(c.idMoto) === Number(idMoto) && ESTADOS_ABIERTOS.includes(c.estado)
  )
  const nuevo = hayReservaAbierta ? 'Reservada' : 'Disponible'
  if (moto.estado !== nuevo) setEstadoMoto(idMoto, nuevo)
}

// Lee las consultas, completa los datos que falten y pasa a "Vencida" las reservas abiertas que superaron las 48 hs
export function obtenerConsultas() {
  const ahora = Date.now()
  const motosAfectadas = new Set()

  const completas = leer().map((c, i) => {
    const consulta = {
      ...c,
      id: c.id ?? `${ahora}-${i}`,
      idMoto: Number(c.idMoto),
      estado: c.estado ?? 'Pendiente',
      notas: c.notas ?? '',
    }
    const vencio = consulta.fechaVencimiento && new Date(consulta.fechaVencimiento).getTime() < ahora
    if (vencio && ESTADOS_ABIERTOS.includes(consulta.estado)) {
      motosAfectadas.add(consulta.idMoto)
      return { ...consulta, estado: 'Vencida' }
    }
    return consulta
  })

  guardar(completas)
  motosAfectadas.forEach(idMoto => sincronizarEstadoMoto(idMoto, completas))
  return completas
}

// Revisa todas las motos con reservas (por ejemplo, después de reponer stock) y corrige su estado
export function sincronizarMotosReservadas() {
  const todas = obtenerConsultas()
  new Set(todas.map(c => c.idMoto)).forEach(idMoto => sincronizarEstadoMoto(idMoto, todas))
}

// Registra la reserva de una cita por 48 hs. No requiere cuenta: alcanza con los datos de contacto.
export function crearReserva(idMoto, datos) {
  const moto = obtenerMoto(idMoto)
  if (!moto) return { ok: false, error: 'La moto que querés reservar ya no está en el catálogo.' }
  if (moto.stock <= 0) return { ok: false, error: 'Esta moto no tiene stock disponible por el momento.' }

  const ahora = new Date()
  const reserva = {
    id: String(ahora.getTime()),
    idMoto: moto.id,
    ...datos,
    estado: 'Pendiente',
    notas: '',
    fechaReserva: ahora.toISOString(),
    fechaVencimiento: new Date(ahora.getTime() + HORAS_RESERVA * 60 * 60 * 1000).toISOString(),
  }

  const todas = [...obtenerConsultas(), reserva]
  guardar(todas)
  sincronizarEstadoMoto(moto.id, todas)
  return { ok: true, reserva }
}

export function actualizarConsulta(id, cambios) {
  const nuevas = obtenerConsultas().map(c => (c.id === id ? { ...c, ...cambios } : c))
  guardar(nuevas)
  const modificada = nuevas.find(c => c.id === id)
  if (modificada) sincronizarEstadoMoto(modificada.idMoto, nuevas)
}
