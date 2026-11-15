import { apiJson, mensajeDeError } from '../../shared/utils/api'

// Todas las funciones devuelven { ok: true, ... } o { ok: false, error }. Solo para el administrador

// GET /usuarios/vendedores: todos los vendedores, activos e inactivos
export async function listarVendedores() {
  const r = await apiJson('/usuarios/vendedores')
  return r.ok ? { ok: true, vendedores: r.data } : { ok: false, error: mensajeDeError(r) }
}

// POST /usuarios/vendedores: alta de un vendedor. datos = { nombre, email, password }
export async function crearVendedor(datos) {
  const r = await apiJson('/usuarios/vendedores', { method: 'POST', body: JSON.stringify(datos) })
  return r.ok ? { ok: true, vendedor: r.data } : { ok: false, error: mensajeDeError(r) }
}

// PATCH /usuarios/:id/activo: baja (false) o reactivación (true) de la cuenta. La baja es lógica: se conserva su historial de ventas
export async function cambiarActivoVendedor(id, activo) {
  const r = await apiJson(`/usuarios/${id}/activo`, { method: 'PATCH', body: JSON.stringify({ activo }) })
  return r.ok ? { ok: true } : { ok: false, error: mensajeDeError(r) }
}
