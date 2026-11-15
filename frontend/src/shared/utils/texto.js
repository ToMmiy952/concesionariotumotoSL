// Normaliza un texto para comparar búsquedas: sin acentos, en minúsculas y sin espacios sobrantes
export function normalizarTexto(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}
