import { obtenerMotos as leerMotos } from '../../admin/productosService'
import { obtenerConsultas } from '../../vendedor/consultasService'
//por ahora es asi porque no tenemos un backend, pero cuando lo tengamos vamos a hacer fetch a la url del backend para traer las motos
// El catálogo lee las mismas motos que gestiona el panel (altas, bajas, stock y reservas)

export async function obtenerMotos() {
  obtenerConsultas() // libera las reservas vencidas antes de mostrar el estado de cada moto
  return leerMotos()
}

export async function obtenerMotoPorId(id) {
  // Con un JSON estático traemos la lista y buscamos. Con un servidor sería:
  // fetch(`${URL_BASE}/productos/${id}`)
  const motos = await obtenerMotos()
  const moto = motos.find((p) => p.id === Number(id))
  if (!moto) {
    throw new Error('La moto que buscás no existe')
  }
  return moto
}
