import { apiJson, mensajeDeError } from '../../shared/utils/api'

// Todas las funciones devuelven { ok: true, ... } o { ok: false, error }

// La API devuelve los importes como texto (numeric de PostgreSQL): se pasan a número
function normalizarItem(i) {
  return {
    idItem: i.id_item_carrito,
    id: i.id_accesorio,
    nombre: i.nombre,
    precio: Number(i.precio),
    imagen: i.imagen,
    talle: i.talle,
    cantidad: i.cantidad,
  }
}

// Carrito del cliente logueado (la API lo crea si todavía no tiene)
export async function obtenerCarrito() {
  const r = await apiJson('/carrito')
  return r.ok ? { ok: true, items: r.data.items.map(normalizarItem) } : { ok: false, error: mensajeDeError(r) }
}

// Agrega un accesorio o suma unidades si ya estaba. La API valida el stock
export async function agregarAlCarrito(idAccesorio, cantidad = 1) {
  const r = await apiJson('/carrito/items', { method: 'POST', body: JSON.stringify({ idAccesorio, cantidad }) })
  return r.ok ? { ok: true } : { ok: false, error: mensajeDeError(r) }
}

// Fija la cantidad de un ítem
export async function cambiarCantidadItem(idItem, cantidad) {
  const r = await apiJson(`/carrito/items/${idItem}`, { method: 'PUT', body: JSON.stringify({ cantidad }) })
  return r.ok ? { ok: true } : { ok: false, error: mensajeDeError(r) }
}

export async function quitarDelCarrito(idItem) {
  const r = await apiJson(`/carrito/items/${idItem}`, { method: 'DELETE' })
  return r.ok ? { ok: true } : { ok: false, error: mensajeDeError(r) }
}
