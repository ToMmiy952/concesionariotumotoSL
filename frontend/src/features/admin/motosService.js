import { apiJson, mensajeDeError } from '../../shared/utils/api'

// La API devuelve los importes como texto (numeric de PostgreSQL): se pasan a número
function normalizarMoto(m) {
  return {
    ...m,
    precio: Number(m.precio),
    stock: Number(m.stock),
    cilindrada: m.cilindrada === null ? null : Number(m.cilindrada),
  }
}

// Todas las funciones devuelven { ok: true, ... } o { ok: false, error }

export async function listarMotos() {
  const r = await apiJson('/motos')
  return r.ok
    ? { ok: true, motos: r.data.map(normalizarMoto) }
    : { ok: false, error: mensajeDeError(r) }
}

export async function obtenerMoto(id) {
  const r = await apiJson(`/motos/${id}`)
  return r.ok
    ? { ok: true, moto: normalizarMoto(r.data) }
    : { ok: false, error: mensajeDeError(r) }
}

// Solo administrador: la API exige el token y el rol ADMINISTRADOR
export async function crearMoto(datos) {
  const r = await apiJson('/motos', {
    method: 'POST',
    body: JSON.stringify(datos),
  })
  return r.ok
    ? { ok: true, idProducto: r.data.id_producto }
    : { ok: false, error: mensajeDeError(r) }
}

export async function actualizarMoto(id, datos) {
  const r = await apiJson(`/motos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  })
  return r.ok ? { ok: true } : { ok: false, error: mensajeDeError(r) }
}

export async function eliminarMoto(id) {
  const r = await apiJson(`/motos/${id}`, { method: 'DELETE' })
  return r.ok ? { ok: true } : { ok: false, error: mensajeDeError(r) }
}
