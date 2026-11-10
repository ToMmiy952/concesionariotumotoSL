import { apiJson, mensajeDeError } from '../../shared/utils/api'

// La API devuelve los importes como texto (numeric de PostgreSQL): se pasan a número
function normalizarAccesorio(a) {
  return {
    ...a,
    precio: Number(a.precio),
    stock: Number(a.stock),
  }
}

// Todas las funciones devuelven { ok: true, ... } o { ok: false, error }

export async function listarAccesorios() {
  const r = await apiJson('/accesorios')
  return r.ok
    ? { ok: true, accesorios: r.data.map(normalizarAccesorio) }
    : { ok: false, error: mensajeDeError(r) }
}

export async function obtenerAccesorio(id) {
  const r = await apiJson(`/accesorios/${id}`)
  return r.ok
    ? { ok: true, accesorio: normalizarAccesorio(r.data) }
    : { ok: false, error: mensajeDeError(r) }
}

// Solo administrador: la API exige el token y el rol ADMINISTRADOR
export async function crearAccesorio(datos) {
  const r = await apiJson('/accesorios', {
    method: 'POST',
    body: JSON.stringify(datos),
  })
  return r.ok
    ? { ok: true, idProducto: r.data.id_producto }
    : { ok: false, error: mensajeDeError(r) }
}

export async function actualizarAccesorio(id, datos) {
  const r = await apiJson(`/accesorios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  })
  return r.ok ? { ok: true } : { ok: false, error: mensajeDeError(r) }
}

export async function eliminarAccesorio(id) {
  const r = await apiJson(`/accesorios/${id}`, { method: 'DELETE' })
  return r.ok ? { ok: true } : { ok: false, error: mensajeDeError(r) }
}
