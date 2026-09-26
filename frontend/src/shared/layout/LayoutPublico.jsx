{/**Este layout publico seria para el que esta mirando las motos, despues ver si hay que 
    hacer otro aparte para el administrativo. Este va usar la barra de busq, nav y footer, ademas de llevar el contenido */}
import { Outlet } from 'react-router'
import BarraBusqueda from './BarraBusqueda'
import Navbar from './Navbar'
import Footer from './Footer'

function LayoutPublico({titulo, logo, enlacesParaNavbar, categorias, ayuda, contacto}) {
    return(
        <>
            <BarraBusqueda titulo={titulo} logo={logo} />
            <Navbar enlaces={enlacesParaNavbar} /> 
            <main> <Outlet /> </main>                       
            <Footer logo={logo} categorias={categorias} ayuda={ayuda} contacto={contacto} />            
        </>
    )
}
export default LayoutPublico