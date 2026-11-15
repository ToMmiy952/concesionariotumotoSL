// Importe en pesos argentinos sin decimales: $3.600.000
export function pesos(n) {
  return Number(n).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}
