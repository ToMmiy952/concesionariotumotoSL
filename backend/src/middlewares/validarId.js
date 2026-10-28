// Se usa con router.param('id', validarId): corta con 400 si el :id no es un entero positivo
export const validarId = (req, res, next, valor) => {
  if (!/^\d+$/.test(valor) || Number(valor) < 1 || Number(valor) > 2147483647) {
    return res.status(400).json({ error: 'El id debe ser un número entero positivo' });
  }
  next();
};
