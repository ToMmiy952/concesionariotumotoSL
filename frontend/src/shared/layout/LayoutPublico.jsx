{/**Este layout publico seria para el que esta mirando las motos, despues ver si hay que
    hacer otro aparte para el administrativo. Este va usar la barra de busq, nav y footer, ademas de llevar el contenido */}
import { Outlet } from 'react-router'
import BarraBusqueda from './BarraBusqueda'
import Navbar from './Navbar'
import Footer from './Footer'
import Carrito from '../../features/carrito/componentes/Carrito'
import {useCarrito} from '../../features/carrito/hooks/useCarrito'
import { obtenerSesion } from '../../features/auth/authService'
import { registrarVentaOnline } from '../../features/vendedor/ventasService'
import { useState } from 'react'

function LayoutPublico({titulo, logo, enlacesParaNavbar, categorias, ayuda, contacto}) {
    const { carrito, agregarProducto, eliminarProducto, cambiarCantidad, vaciarCarrito, cantidadTotal } = useCarrito();
    const [carritoAbierto, setCarritoAbierto] = useState(false)
    // se incrementa con cada compra para que las páginas vuelvan a leer el stock actualizado
    const [versionStock, setVersionStock] = useState(0)

    // Paga el carrito: registra la venta online, descuenta stock y vacía el carrito
    function comprar() {
        const sesion = obtenerSesion()
        if (!sesion || sesion.rol !== 'cliente') {
            alert('Para comprar accesorios tenés que ingresar con una cuenta de cliente.')
            return
        }
        const resultado = registrarVentaOnline(sesion, carrito)
        if (!resultado.ok) {
            alert(resultado.error)
            return
        }
        vaciarCarrito()
        setCarritoAbierto(false)
        setVersionStock(v => v + 1)
        alert(`¡Compra realizada con éxito! Total: $${resultado.venta.monto.toLocaleString('es-AR')}. Podés ver el detalle en "Mis pedidos".`)
    }

    return(
        <>
            <BarraBusqueda titulo={titulo} logo={logo} onAbrirCarrito={()=>setCarritoAbierto(true)} cantidadItems={cantidadTotal}/>
            <Navbar enlaces={enlacesParaNavbar} />
            <Carrito
                abierto={carritoAbierto}
                onCerrar={() => setCarritoAbierto(false)}
                carrito={carrito}
                eliminarProducto={eliminarProducto}
                cambiarCantidad={cambiarCantidad}
                vaciarCarrito={vaciarCarrito}
                onComprar={comprar}
            />
            <main> <Outlet context={{ carrito, agregarProducto, eliminarProducto, vaciarCarrito, versionStock }} /> </main>
            <Footer logo={logo} categorias={categorias} ayuda={ayuda} contacto={contacto} />
        </>
    )
}
export default LayoutPublico
