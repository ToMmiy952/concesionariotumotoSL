import { apiJson, mensajeDeError } from '../../shared/utils/api'

export const PORCENTAJE_COMISION = 10 // % por defecto

export function calcularComision(monto) {
  return monto * PORCENTAJE_COMISION / 100
}

// ---- API: ventas (POST /ventas/online, POST /ventas/motos, GET /ventas, GET /ventas/:id) ----
// Todas devuelven { ok: true, ... } o { ok: false, error }

// Pasa los importes (texto en la API) a número
function normalizarVenta(v) {
  return {
    id: v.id_venta,
    fecha: v.fecha,
    monto: Number(v.monto_total),
    tipo: v.tipo_venta,
    idCliente: v.id_cliente,
    idVendedor: v.id_vendedor,
    items: (v.detalle ?? []).map(d => ({
      idProducto: d.id_producto,
      nombre: d.producto,
      cantidad: d.cantidad,
      precioUnitario: Number(d.precio_unitario_historico),
    })),
  }
}

// Paga el carrito del cliente: la API crea la venta, descuenta el stock y vacía el carrito
export async function pagarCarrito() {
  const r = await apiJson('/ventas/online', { method: 'POST' })
  return r.ok ? { ok: true, venta: normalizarVenta(r.data) } : { ok: false, error: mensajeDeError(r) }
}

// Venta presencial de una moto (vendedor): la API crea la venta, descuenta el stock y sincroniza el estado
export async function registrarVentaMoto(idMoto, idReserva = null) {
  const cuerpo = idReserva ? { idMoto, idReserva } : { idMoto }
  const r = await apiJson('/ventas/motos', { method: 'POST', body: JSON.stringify(cuerpo) })
  return r.ok ? { ok: true, venta: normalizarVenta(r.data) } : { ok: false, error: mensajeDeError(r) }
}

// Ventas visibles para el usuario logueado (cliente: las suyas, vendedor: las suyas, admin: todas), sin detalle
export async function listarVentas() {
  const r = await apiJson('/ventas')
  return r.ok ? { ok: true, ventas: r.data.map(normalizarVenta) } : { ok: false, error: mensajeDeError(r) }
}

export async function obtenerVentaPorId(id) {
  const r = await apiJson(`/ventas/${id}`)
  return r.ok ? { ok: true, venta: normalizarVenta(r.data) } : { ok: false, error: mensajeDeError(r) }
}

// El listado no trae el detalle: se pide el de cada venta. Los filtros (tipo, mes) los hace quien lo use, en el front
export async function listarVentasConDetalle() {
  const lista = await listarVentas()
  if (!lista.ok) return lista
  const detalles = await Promise.all(lista.ventas.map(v => obtenerVentaPorId(v.id)))
  const fallo = detalles.find(d => !d.ok)
  if (fallo) return fallo
  return { ok: true, ventas: detalles.map(d => d.venta) }
}
