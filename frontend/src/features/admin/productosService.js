import motosIniciales from '../../../../backend/data/motos.json'

const CLAVE = 'motos'

export function obtenerMotos() {
  const guardado = localStorage.getItem(CLAVE)
  if (!guardado) {
    localStorage.setItem(CLAVE, JSON.stringify(motosIniciales))
    return motosIniciales
  }
  return JSON.parse(guardado)
}

function guardar(motos) {
  localStorage.setItem(CLAVE, JSON.stringify(motos))
}

export function obtenerMoto(id) {
  return obtenerMotos().find(m => m.id === Number(id))
}

export function crearMoto(datos) {
  const motos = obtenerMotos()
  const nuevoId = motos.length ? Math.max(...motos.map(m => m.id)) + 1 : 1
  guardar([...motos, { ...datos, id: nuevoId }])
}

export function editarMoto(id, datos) {
  guardar(obtenerMotos().map(m => m.id === Number(id) ? { ...m, ...datos } : m))
}

export function eliminarMoto(id) {
  guardar(obtenerMotos().filter(m => m.id !== Number(id)))
}

export function cambiarStock(id, cantidad) {
  guardar(obtenerMotos().map(m => {
    if (m.id !== Number(id)) return m
    const stock = Math.max(0, m.stock + cantidad) // nunca baja de 0
    let estado = m.estado
    if (stock === 0) estado = 'Agotado'
    else if (m.estado === 'Agotado') estado = 'Disponible'
    return { ...m, stock, estado }
  }))
}