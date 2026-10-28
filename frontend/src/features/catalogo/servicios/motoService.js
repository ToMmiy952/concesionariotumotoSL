const API_URL = 'http://localhost:3000/api/v1/motos'


export async function obtenerMotos() {
  const respuesta = await fetch(API_URL);
  if (!respuesta.ok) {
    throw new Error('Error al obtener las motos');
  }
  return await respuesta.json();
}

export async function obtenerMotoPorId(id) {
  const respuesta = await fetch(`${API_URL}/${id}`);

  if (!respuesta.ok) {
    throw new Error('La moto solicitada no existe o no se pudo cargar.');
  }

  return await respuesta.json();
}
