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
    const { carrito, agregarProducto, eliminarProducto, vaciarCarrito, cantidadTotal } = useCarrito();
    const [carritoAbierto, setCarritoAbierto] = useState(false)
    
    return(
        <>
            <BarraBusqueda titulo={titulo} logo={logo} onAbrirCarrito={()=>setCarritoAbierto(true)} cantidadItems={cantidadTotal}/>
            <Navbar enlaces={enlacesParaNavbar} /> 
            <Carrito
                abierto={carritoAbierto}
                onCerrar={() => setCarritoAbierto(false)}
                carrito={carrito}
                eliminarProducto={eliminarProducto}
                vaciarCarrito={vaciarCarrito}
            />
            <main> <Outlet context={{ carrito, agregarProducto, eliminarProducto, vaciarCarrito }} /> </main>                       
            <Footer logo={logo} categorias={categorias} ayuda={ayuda} contacto={contacto} />            
        </>
    )
}
export default LayoutPublico