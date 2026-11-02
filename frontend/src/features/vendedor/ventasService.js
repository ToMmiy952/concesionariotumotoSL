import ventasIniciales from '../../../../backend/data/ventas.json'
import { obtenerMoto, cambiarStock } from '../admin/productosService'
import { hoyLocal, horaLocal } from '../../shared/utils/fechas'
import { apiJson, mensajeDeError } from '../../shared/utils/api'

const CLAVE = 'ventas'
export const PORCENTAJE_COMISION = 10 // % por defecto

export function calcularComision(monto) {
  return monto * PORCENTAJE_COMISION / 100
}

export function obtenerVentas() {
  const guardado = localStorage.getItem(CLAVE)
  if (!guardado) {
    localStorage.setItem(CLAVE, JSON.stringify(ventasIniciales))
    return ventasIniciales
  }
  return JSON.parse(guardado)
}

function guardar(ventas) {
  localStorage.setItem(CLAVE, JSON.stringify(ventas))
}

function siguienteId(ventas) {
  return ventas.length ? Math.max(...ventas.map(v => v.id)) + 1 : 1
}

// Venta presencial de una moto, registrada por un vendedor (genera comisión)
export function registrarVenta(idMoto, vendedor) {
  const moto = obtenerMoto(idMoto)
  if (!moto || moto.stock <= 0) return false // sin stock no se vende

  const ventas = obtenerVentas()
  const motoModelo = `${moto.marca} ${moto.modelo}`
  const venta = {
    id: siguienteId(ventas),
    tipo: 'Moto',
    idMoto: moto.id,
    motoModelo,
    descripcion: motoModelo,
    idVendedor: vendedor.id,
    nombreVendedor: vendedor.nombre,
    fecha: hoyLocal(),
    hora: horaLocal(),
    monto: moto.precio,
    comision: calcularComision(moto.precio),
  }
  guardar([...ventas, venta])
  cambiarStock(moto.id, -1)
  return true
}

// ---- API: ventas (POST /ventas/online, GET /ventas, GET /ventas/:id) ----
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
