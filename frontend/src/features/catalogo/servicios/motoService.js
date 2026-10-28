import { apiFetch } from '../../../shared/utils/api'

export async function obtenerMotos() {
  const respuesta = await apiFetch('/motos');
  if (!respuesta.ok) {
    throw new Error('Error al obtener las motos');
  }
  return await respuesta.json();
}

export async function obtenerMotoPorId(id) {
  const respuesta = await apiFetch(`/motos/${id}`);

  if (!respuesta.ok) {
    throw new Error('La moto solicitada no existe o no se pudo cargar.');
  }

  return await respuesta.json();
}
