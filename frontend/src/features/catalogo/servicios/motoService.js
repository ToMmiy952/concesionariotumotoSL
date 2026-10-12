import motos from '../../../../../backend/data/motos.json'
//por ahora es asi porque no tenemos un backend, pero cuando lo tengamos vamos a hacer fetch a la url del backend para traer los accesorios
export async function obtenerMotos() {
  return motos
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

