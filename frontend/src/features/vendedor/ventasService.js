import ventasIniciales from '../../../../backend/data/ventas.json'
import { obtenerMoto, cambiarStock } from '../admin/productosService'
import { buscarAccesorio, descontarStockAccesorio } from '../catalogo/servicios/accesorioService'
import { hoyLocal, horaLocal } from '../../shared/utils/fechas'

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

// Compra online de accesorios desde el carrito de un cliente. No genera comisión (no hay vendedor).
export function registrarVentaOnline(cliente, items) {
  if (!items.length) return { ok: false, error: 'El carrito está vacío.' }

  // un mismo accesorio puede estar en varios talles: el stock se valida sobre el total
  const pedido = {}
  items.forEach(i => { pedido[i.id] = (pedido[i.id] || 0) + i.cantidad })

  for (const [id, cantidad] of Object.entries(pedido)) {
    const accesorio = buscarAccesorio(id)
    if (!accesorio) return { ok: false, error: 'Uno de los accesorios ya no está disponible.' }
    if (accesorio.stock < cantidad) {
      return { ok: false, error: `Stock insuficiente de ${accesorio.nombre} (disponible: ${accesorio.stock}).` }
    }
  }

  // el precio se toma del catálogo y queda guardado como precio histórico de la compra
  const detalle = items.map(i => ({
    idAccesorio: i.id,
    nombre: i.nombre,
    talle: i.talle,
    cantidad: i.cantidad,
    precioUnitario: buscarAccesorio(i.id).precio,
  }))
  const monto = detalle.reduce((acc, d) => acc + d.precioUnitario * d.cantidad, 0)

  const ventas = obtenerVentas()
  const venta = {
    id: siguienteId(ventas),
    tipo: 'Accesorio Online',
    idCliente: cliente.id,
    nombreCliente: cliente.nombre,
    idVendedor: null,
    nombreVendedor: 'Online',
    descripcion: detalle.map(d => `${d.nombre}${d.talle ? ` (${d.talle})` : ''} x${d.cantidad}`).join(', '),
    items: detalle,
    fecha: hoyLocal(),
    hora: horaLocal(),
    monto,
    comision: 0,
  }
  guardar([...ventas, venta])
  Object.entries(pedido).forEach(([id, cantidad]) => descontarStockAccesorio(id, cantidad))
  return { ok: true, venta }
}
