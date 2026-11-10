import { apiFetch } from '../../../shared/utils/api'

export async function obtenerAccesorios() {
  const respuesta = await apiFetch('/accesorios');

  if (!respuesta.ok) {
    throw new Error('Error al obtener los accesorios');
  }

  return await respuesta.json();
}

export async function obtenerAccesorioPorId(id) {
  const respuesta = await apiFetch(`/accesorios/${id}`);

  if (!respuesta.ok) {
    throw new Error('El accesorio solicitado no existe o no se pudo cargar.');
  }

  return await respuesta.json();
}
