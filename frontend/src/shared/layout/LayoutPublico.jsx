{/**Este layout publico seria para el que esta mirando las motos, despues ver si hay que
    hacer otro aparte para el administrativo. Este va usar la barra de busq, nav y footer, ademas de llevar el contenido */}
import { Outlet } from 'react-router'
import BarraBusqueda from './BarraBusqueda'
import Navbar from './Navbar'
import Footer from './Footer'
import Carrito from '../../features/carrito/componentes/Carrito'
import {useCarrito} from '../../features/carrito/hooks/useCarrito'
import { useState } from 'react'

function LayoutPublico({titulo, logo, enlacesParaNavbar, categorias, ayuda, contacto}) {
    const { carrito, agregarProducto, eliminarProducto, cambiarCantidad, vaciarCarrito, recargarCarrito, cantidadTotal } = useCarrito();
    const [carritoAbierto, setCarritoAbierto] = useState(false)
    // se incrementa con cada compra para que las páginas vuelvan a leer el stock actualizado
    const [versionStock, setVersionStock] = useState(0)

    // Las acciones del carrito devuelven { ok, error }: si la API rechaza algo (por ejemplo, falta de stock) se avisa
    function avisarSiFallo(accion) {
        return async (...args) => {
            const r = await accion(...args)
            if (r && !r.ok) alert(r.error)
            return r
        }
    }

    // La compra la hace la pantalla de pago (POST /ventas/online): acá solo se refresca el carrito y el stock
    async function compraRealizada() {
        await recargarCarrito()
        setVersionStock(v => v + 1)
    }

    return(
        <>
            <BarraBusqueda titulo={titulo} logo={logo} onAbrirCarrito={()=>setCarritoAbierto(true)} cantidadItems={cantidadTotal}/>
            <Navbar enlaces={enlacesParaNavbar} />
            <Carrito
                abierto={carritoAbierto}
                onCerrar={() => setCarritoAbierto(false)}
                carrito={carrito}
                eliminarProducto={avisarSiFallo(eliminarProducto)}
                cambiarCantidad={avisarSiFallo(cambiarCantidad)}
                vaciarCarrito={vaciarCarrito}
            />
            <main> <Outlet context={{ carrito, agregarProducto, eliminarProducto, vaciarCarrito, compraRealizada, versionStock }} /> </main>
            <Footer logo={logo} categorias={categorias} ayuda={ayuda} contacto={contacto} />
        </>
    )
}
export default LayoutPublico
