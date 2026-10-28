import { pool } from '../config/db.js';

export const carritoRepository = {
  // Devuelve el id del carrito del cliente; si todavía no tiene, lo crea
  async obtenerOCrearId(idCliente) {
    const existente = await pool.query('SELECT id_carrito FROM carritos WHERE id_cliente = $1', [idCliente]);
    if (existente.rows.length > 0) return existente.rows[0].id_carrito;

    const nuevo = await pool.query('INSERT INTO carritos (id_cliente) VALUES ($1) RETURNING id_carrito', [idCliente]);
    return nuevo.rows[0].id_carrito;
  },

  async listarItems(idCarrito) {
    const result = await pool.query(
      `SELECT ic.id_item_carrito, ic.id_accesorio, a.nombre, p.precio,
              p.imagen, a.talle, ic.cantidad, (p.precio * ic.cantidad) AS subtotal
       FROM item_carrito ic
       INNER JOIN accesorios a ON ic.id_accesorio = a.id_producto
       INNER JOIN productos p ON a.id_producto = p.id_producto
       WHERE ic.id_carrito = $1 AND p.esta_activo = true
       ORDER BY ic.id_item_carrito`,
      [idCarrito]
    );
    return result.rows;
  },

  // Stock de un accesorio activo, o null si no existe
  async stockAccesorio(idAccesorio) {
    const result = await pool.query(
      `SELECT stock FROM productos WHERE id_producto = $1 AND tipo = 'ACCESORIO' AND esta_activo = true`,
      [idAccesorio]
    );
    return result.rows[0]?.stock ?? null;
  },

  async buscarItemPorAccesorio(idCarrito, idAccesorio) {
    const result = await pool.query(
      'SELECT id_item_carrito, cantidad FROM item_carrito WHERE id_carrito = $1 AND id_accesorio = $2',
      [idCarrito, idAccesorio]
    );
    return result.rows[0] ?? null;
  },

  // Busca un ítem SOLO si pertenece al carrito del cliente indicado (evita tocar ítems ajenos)
  async buscarItemDeCliente(idItem, idCliente) {
    const result = await pool.query(
      `SELECT ic.id_item_carrito, ic.cantidad, p.stock
       FROM item_carrito ic
       INNER JOIN carritos c ON ic.id_carrito = c.id_carrito
       INNER JOIN productos p ON ic.id_accesorio = p.id_producto
       WHERE ic.id_item_carrito = $1 AND c.id_cliente = $2`,
      [idItem, idCliente]
    );
    return result.rows[0] ?? null;
  },

  async insertarItem(idCarrito, idAccesorio, cantidad) {
    await pool.query(
      'INSERT INTO item_carrito (id_carrito, id_accesorio, cantidad) VALUES ($1, $2, $3)',
      [idCarrito, idAccesorio, cantidad]
    );
  },

  async actualizarCantidad(idItem, cantidad) {
    const result = await pool.query(
      'UPDATE item_carrito SET cantidad = $1 WHERE id_item_carrito = $2 RETURNING *',
      [cantidad, idItem]
    );
    return result.rows[0];
  },

  async eliminarItem(idItem) {
    await pool.query('DELETE FROM item_carrito WHERE id_item_carrito = $1', [idItem]);
  },
};
