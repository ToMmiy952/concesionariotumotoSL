const esNumero = (v) => v !== null && v !== '' && Number.isFinite(Number(v));

export const precioValido = (v) => esNumero(v) && Number(v) > 0;
export const enteroNoNegativo = (v) => esNumero(v) && Number.isInteger(Number(v)) && Number(v) >= 0;
export const enteroPositivo = (v) => enteroNoNegativo(v) && Number(v) > 0;
export const emailValido = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Valida los campos numéricos de un producto (solo los que vienen en el body). Devuelve el mensaje de error o null
export function errorEnCamposProducto({ precio, stock, cilindrada }) {
  if (precio !== undefined && !precioValido(precio)) return 'El precio debe ser un número mayor a 0';
  if (stock !== undefined && !enteroNoNegativo(stock)) return 'El stock debe ser un entero mayor o igual a 0';
  if (cilindrada != null && !enteroPositivo(cilindrada)) return 'La cilindrada debe ser un entero mayor a 0';
  return null;
}
