import './App.css'
import {RouterProvider } from 'react-router'
import {router} from './router'
{/**los css si o si van con extension, y en este caso no hay que poner con la sintaxis from */ }
import './shared/styles/style.css'


/**Para levantar el servidor: estar parado en la carpeta frontend y poner npm run dev */
function App() {
  return (
    <> {/**Se usan para poder retornar múltiples elementos, de lo contrario no se podría retornar más de un elemento */}
      {/**Para usar la propiedad children tengo que abrir la etiqueta y cerrarla, no puedo usar la autocerrado */}
      <RouterProvider router={router}></RouterProvider> {/**entrega el router a la aplicacion*/}
    </>
  )
}
export default App
