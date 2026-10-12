import accesorios from '../../../../../backend/data/accesorios.json'
//por ahora es asi porque no tenemos un backend, pero cuando lo tengamos vamos a hacer fetch a la url del backend para traer los accesorios
export async function obtenerAccesorios() {
  return accesorios
}

export async function obtenerAccesorioPorId(id) {
  // Con un JSON estático traemos la lista y buscamos. Con un servidor sería:
  // fetch(`${URL_BASE}/productos/${id}`)
  const accesorios = await obtenerAccesorios()
  const accesorio = accesorios.find((p) => p.id === Number(id))
  if (!accesorio) {
    throw new Error('El accesorio que buscás no existe')
  }
  return accesorio
}

