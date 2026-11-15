import { Link, Navigate, useLocation } from 'react-router'
import { pesos } from '../../../shared/utils/formato'
import { ETIQUETA_METODO_PAGO } from '../../vendedor/ventasService'
import { formatearFechaHora } from '../../../shared/utils/fechas'
import '../checkout.css'

// Pantalla que ve el cliente al terminar de pagar. La venta llega por el estado de la navegación (desde PantallaPago)
function CompraExitosaPage() {
  const { state } = useLocation()
  const venta = state?.venta

  // Si se entra directo a esta dirección (o se recarga la página) no hay compra para mostrar
  if (!venta) return <Navigate to="/mis-pedidos" replace />

  return (
    <div className="container my-5">
      <div className="compra-exitosa">
        <span className="compra-exitosa-check"><i className="bi bi-check-lg"></i></span>
        <h2 className="fw-bold">¡Compra realizada con éxito!</h2>
        <p className="text-secondary">Gracias por tu compra. Guardá el número de pedido: <strong>#{venta.id}</strong></p>

        <div className="checkout-tarjeta compra-exitosa-detalle mt-4">
          <div className="d-flex justify-content-between flex-wrap mb-3">
            <strong>Pedido #{venta.id}</strong>
            <span className="text-muted">{formatearFechaHora(venta.fecha)}</span>
          </div>

          {venta.items.map((item, i) => (
            <div key={i} className="d-flex justify-content-between py-1">
              <span>{item.nombre} x{item.cantidad}</span>
              <span>{pesos(item.precioUnitario * item.cantidad)}</span>
            </div>
          ))}

          <div className="d-flex justify-content-between fw-bold fs-5 border-top mt-2 pt-2">
            <span>Total</span>
            <span className="text-primary">{pesos(venta.monto)}</span>
          </div>

          <div className="row g-3 mt-2">
            <div className="col-sm-6">
              <div className="checkout-dato mb-0">
                <div>
                  <small>Método de pago</small>
                  <strong>{ETIQUETA_METODO_PAGO[venta.metodoPago] ?? '—'}</strong>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="checkout-dato mb-0">
                <div>
                  <small>Entrega</small>
                  <strong>{venta.tipoEntrega === 'Domicilio' ? 'Envío a domicilio' : 'Retiro en la tienda'}</strong>
                  {venta.direccionEntrega && <small>{venta.direccionEntrega}</small>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-center gap-2 flex-wrap mt-4">
          <Link to="/mis-pedidos" className="btn btn-primary px-4">Ver mis pedidos</Link>
          <Link to="/accesorios" className="btn btn-outline-secondary px-4">Seguir comprando</Link>
        </div>
      </div>
    </div>
  )
}

export default CompraExitosaPage
