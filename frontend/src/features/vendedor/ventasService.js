import ventasIniciales from '../../../../backend/data/ventas.json'
import { obtenerMoto, cambiarStock } from '../admin/productosService'

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

export function registrarVenta(idMoto, vendedor) {
  const moto = obtenerMoto(idMoto)
  if (!moto || moto.stock <= 0) return false // sin stock no se vende

  const ventas = obtenerVentas()
  const nuevoId = ventas.length ? Math.max(...ventas.map(v => v.id)) + 1 : 1
  const venta = {
    id: nuevoId,
    idMoto: moto.id,
    motoModelo: `${moto.marca} ${moto.modelo}`,
    idVendedor: vendedor.id,
    nombreVendedor: vendedor.nombre,
    fecha: new Date().toISOString().slice(0, 10), // "2026-10-02"
    monto: moto.precio,
    comision: calcularComision(moto.precio),
  }
  localStorage.setItem(CLAVE, JSON.stringify([...ventas, venta]))
  cambiarStock(moto.id, -1)
  return true
}