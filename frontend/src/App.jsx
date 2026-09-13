import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import LayoutPublico from './shared/layout/LayoutPublico'
{/**los css si o si van con extension, y en este caso no hay que poner con la sintaxis from */ }
import './shared/styles/style.css'


/**Para levantar el servidor: estar parado en la carpeta frontend y poner npm run dev */
  {/** enlaces para el navbar */ }
  const enlacesParaNavbar = [
    { id: 1, texto: "Inicio", destino: "#" },
    { id: 2, texto: "Motos", destino: "#" },
    { id: 3, texto: "Planes de ahorro", destino: "#" },
    { id: 4, texto: "Servicio tecnico", destino: "#" },
    { id: 5, texto: "Contacto", destino: "#" },
    { id: 6, texto: "Centro de ayuda", destino: "#" }
  ]
  {/*-------------------------------------------*/ }

  {/**estas son las props para la barra de busqueda */ }
  const titulo = "TuMotoSL"
  const logo = "/logo.jpg"
  {/*-------------------------------------------*/ }

  {/**estas son las props para el Footer */ }
  const categorias= [
    {id: 1, texto: "Motos", destino: "#"},
    {id: 2, texto: "Cascos", destino: "#"},
    {id: 3, texto: "Planes de ahorro", destino: "#"},
    {id: 4, texto: "Servicio tecnico", destino: "#"},
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
  
  {/*-------------------------------------------*/ }

function App() {
  const [count, setCount] = useState(0)

  {/**Tengo que definir cada elemento con un id, texto y destino, cada uno entre llaves y separados por , */ }

  return (
    <> {/**Se usan para poder retornar múltiples elementos, de lo contrario no se podría retornar más de un elemento */}      
      {/**Para usar la propiedad children tengo que abrir la etiqueta y cerrarla, no puedo usar la autocerrado */}
      <LayoutPublico titulo={titulo} logo={logo} enlacesParaNavbar={enlacesParaNavbar} categorias={categorias} ayuda={ayuda} contacto={contacto}>
        {/**Todo lo que vaya dentro de las etiquetas de layout va ser considerado como children en el componente hijo! */}
        <div>
          <h1>Bienvenido a TuMotoSL</h1>
          <p>Explora nuestras motos y encuentra la que mejor se adapte a tus necesidades.</p>
        </div>
      </LayoutPublico>
    </>
  )
}
export default App
