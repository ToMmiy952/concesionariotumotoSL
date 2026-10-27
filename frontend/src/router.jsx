import {createBrowserRouter} from 'react-router'
import LayoutPublico from './shared/layout/LayoutPublico'
import Home from './features/home/Home'
import Catalogo from './features/catalogo/paginas/CatalogoMotos'
import DetalleMoto from './features/catalogo/paginas/DetalleMoto'
import PlanesAhorro from './features/planahorro/PlanesAhorro'
import ServicioTecnico from './features/serviciotecnico/ServicioTecnico'
import Contacto from './features/contacto/Contacto'
import Accesorios from './features/catalogo/paginas/CatalogoAccesorios'
import PaginaNoEncontrada from './shared/paginas/PaginaNoEncontrada'
import DetalleAccesorio from './features/catalogo/paginas/DetalleAccesorio'
import LoginPage from './features/auth/LoginPage'
import RegistroPage from './features/auth/RegistroPage'
import LayoutGestor from './shared/layout/LayoutGestor'
import PanelInicioPage from './features/admin/PanelInicioPage'
import ProductosPage from './features/admin/ProductosPage'
import ProductoFormPage from './features/admin/ProductoFormPage'
import { protegerRuta, redirigirSiHaySesion } from './features/auth/loaders'
import PedidosPage from './features/vendedor/PedidosPage'
import StockPage from './features/vendedor/StockPage'
import ComisionesPage from './features/vendedor/ComisionesPage'
import PantallaPago from './features/carrito/paginas/PantallaPago'
import MisPedidosPage from './features/cliente/MisPedidosPage'

//Estos datos inicialmente estaban en app.jsx pero ahora van en router, ya que app queda limpia solo con router.
  const enlacesParaNavbar = [
    { id: 1, texto: "Inicio", destino: "/" },
    { id: 2, texto: "Motos", destino: "/catalogo" },
    {id: 3, texto: "Accesorios", destino:"/accesorios"},
    { id: 4, texto: "Planes de ahorro", destino: "/planahorro" },
    { id: 5, texto: "Servicio tecnico", destino: "/serviciotecnico" },
    { id: 6, texto: "Contacto", destino: "/contacto" }
  ]
  {/*-------------------------------------------*/ }

  {/**estas son las props para la barra de busqueda */ }
  const titulo = "TuMotoSL"
  const logo = "/logo.jpg"
  {/*-------------------------------------------*/ }

  {/**estas son las props para el Footer */ }
  const categorias= [
    {id: 1, texto: "Motos", destino: "/catalogo"},
    {id: 2, texto: "Cascos", destino: "#"},
    {id: 3, texto: "Planes de ahorro", destino: "/planahorro"},
    {id: 4, texto: "Servicio tecnico", destino: "/serviciotecnico"},
    {id: 5, texto: "Accesorios", destino: "#"},
    {id: 6, texto: "Arrepentimiento de compra", destino: "#"}
  ]
  const ayuda= [
    {id: 1, texto: "Quienes somos", destino: "#"},
    {id: 2, texto: "Guia de compra", destino: "#"},
    {id: 3, texto: "Medios de pago", destino: "#"},
    {id: 4, texto: "Preguntas frecuentes", destino: "#"},
    {id: 5, texto: "Terminos y condiciones", destino: "#"},
    {id: 6, texto: "Cambios y devoluciones", destino: "#"},
    {id: 7, texto: "Contacto", destino: "#"},
    {id: 8, texto: "Libro de quejas online", destino: "#"}
  ]
  const contacto= [
    {id: 1, texto: "Contacto", contenido:"Tel: 12345678"},
    {id: 2, texto:"WhatsApp", contenido:"+54 9 1234 5678"},
    {id: 3, texto:"Mail", contenido:"tumotosl@gmail.com"}
  ]

export const router = createBrowserRouter([
    //-----------vista publica: Navbarpublico + Outlet + Footer----------
    {path: '/', element: <LayoutPublico titulo={titulo} logo={logo} enlacesParaNavbar={enlacesParaNavbar} categorias={categorias}
        ayuda={ayuda} contacto={contacto}/>, 
        
        //aca dentro de layoutPublico declaramos todos los hijos de el, con children
            // osea hijos, porque son los que se van a dibujar dentro de este layout
            children: [{
                index: true, element: <Home/> },//con index true colocamos por defecto que cuando la URL sea exactamente / la pagina a dibujar es Home
                                                //para agregar mas hijos a layout pongo una coma (,) y llaves para indicar mas elementos,{}, pero dentro del corchete que seria el arreglo de hijos
                {path:'catalogo', element: <Catalogo/>},
                {path: 'catalogo/:id', element: <DetalleMoto/>},
                {path: 'planahorro', element :<PlanesAhorro/>},
                {path: 'serviciotecnico', element: <ServicioTecnico/>},
                {path: 'contacto', element: <Contacto/>},
                {path: 'accesorios', element: <Accesorios/>},
                {path: 'accesorios/:id', element: <DetalleAccesorio/>},
                {path: 'PantallaPago', element: <PantallaPago/>},
                {path: 'mis-pedidos', element: <MisPedidosPage/>, loader: protegerRuta(['cliente'])},
                {path: '*', element: <PaginaNoEncontrada/>}
                //RECORDARRRRRRRRR: Agregar el * para capturar un error de pagina no encontrada
            
        ]
    },

    { path: '/login', element: <LoginPage />, loader: redirigirSiHaySesion },
    { path: '/registro', element: <RegistroPage />, loader: redirigirSiHaySesion },
    {
      path: '/gestor',
      element: <LayoutGestor />,
      loader: protegerRuta(['vendedor', 'administrador']),
      children: [
        { index: true, element: <PanelInicioPage />, loader: protegerRuta(['administrador']) },
        { path: 'pedidos', element: <PedidosPage /> },
        { path: 'stock', element: <StockPage /> },
        { path: 'productos', element: <ProductosPage />, loader: protegerRuta(['administrador']) },
        { path: 'productos/nuevo', element: <ProductoFormPage />, loader: protegerRuta(['administrador']) },
        { path: 'productos/:id/editar', element: <ProductoFormPage />, loader: protegerRuta(['administrador']) },
        { path: 'comisiones', element: <ComisionesPage />, loader: protegerRuta(['vendedor']) },
      ],
    },

    //----------Aca deberiamos declarar vista privada
])