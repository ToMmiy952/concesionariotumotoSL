import { apiJson, mensajeDeError } from '../../shared/utils/api'

// GET /metricas/admin (solo administrador). Devuelve { ok: true, metricas } o { ok: false, error }
export async function obtenerMetricasAdmin() {
  const r = await apiJson('/metricas/admin')
  return r.ok ? { ok: true, metricas: r.data } : { ok: false, error: mensajeDeError(r) }
}
