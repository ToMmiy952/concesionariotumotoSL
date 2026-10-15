import accesoriosIniciales from '../../../../../backend/data/accesorios.json'
//por ahora es asi porque no tenemos un backend, pero cuando lo tengamos vamos a hacer fetch a la url del backend para traer los accesorios
// El stock cambia con cada compra, por eso la fuente de datos es localStorage (se siembra con el JSON)
const CLAVE = 'accesorios'

function leer() {
  const guardado = localStorage.getItem(CLAVE)
  if (!guardado) {
    localStorage.setItem(CLAVE, JSON.stringify(accesoriosIniciales))
    return accesoriosIniciales
  }
  return JSON.parse(guardado)
}

function guardar(accesorios) {
  localStorage.setItem(CLAVE, JSON.stringify(accesorios))
}

export async function obtenerAccesorios() {
  return leer()
}

export async function obtenerAccesorioPorId(id) {
  // Con un JSON estático traemos la lista y buscamos. Con un servidor sería:
  // fetch(`${URL_BASE}/productos/${id}`)
  const accesorio = buscarAccesorio(id)
  if (!accesorio) {
    throw new Error('El accesorio que buscás no existe')
  }
  return accesorio
}

// versión síncrona, para validar stock dentro de otras funciones
export function buscarAccesorio(id) {
  return leer().find((a) => a.id === Number(id))
}

export function descontarStockAccesorio(id, cantidad) {
  guardar(leer().map((a) => (a.id === Number(id) ? { ...a, stock: Math.max(0, a.stock - cantidad) } : a)))
}
