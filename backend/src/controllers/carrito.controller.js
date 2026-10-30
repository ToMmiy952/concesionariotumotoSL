import { pool } from '../config/db.js';
import { enteroPositivo } from '../middlewares/validaciones.js';

// Devuelve el id del carrito del cliente; si todavía no tiene, lo crea (un carrito por cliente)
async function obtenerOCrearIdCarrito(idCliente) {
  const existente = await pool.query('SELECT id_carrito FROM carritos WHERE id_cliente = $1', [idCliente]);
  if (existente.rows.length > 0) return existente.rows[0].id_carrito;

  const nuevo = await pool.query('INSERT INTO carritos (id_cliente) VALUES ($1) RETURNING id_carrito', [idCliente]);
  return nuevo.rows[0].id_carrito;
}

// Busca un ítem SOLO si pertenece al carrito del cliente indicado (evita tocar ítems ajenos)
async function buscarItemDeCliente(idItem, idCliente) {
  const result = await pool.query(
    `SELECT ic.id_item_carrito, ic.cantidad, p.stock
     FROM item_carrito ic
     INNER JOIN carritos c ON ic.id_carrito = c.id_carrito
     INNER JOIN productos p ON ic.id_accesorio = p.id_producto
     WHERE ic.id_item_carrito = $1 AND c.id_cliente = $2`,
    [idItem, idCliente]
  );
  return result.rows[0] ?? null;
}

export const carritoController = {
  // GET /api/v1/carrito (carrito del cliente autenticado; se crea si todavía no tiene)
  async obtenerCarrito(req, res) {
    const idCarrito = await obtenerOCrearIdCarrito(req.usuario.id_usuario);

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

    res.json({
      id_carrito: idCarrito,
      items: result.rows,
      total: result.rows.reduce((acc, item) => acc + Number(item.subtotal), 0),
    });
  },

  // POST /api/v1/carrito/items (agrega un accesorio o suma cantidad si ya estaba)
  async agregarItem(req, res) {
    const { idAccesorio, cantidad = 1 } = req.body;

    if (!enteroPositivo(idAccesorio) || !enteroPositivo(cantidad)) {
      return res.status(400).json({ error: 'Debes proporcionar un idAccesorio válido y una cantidad entera mayor a 0' });
    }

    const producto = await pool.query(
      `SELECT stock FROM productos WHERE id_producto = $1 AND tipo = 'ACCESORIO' AND esta_activo = true`,
      [idAccesorio]
    );
    if (producto.rows.length === 0) {
      return res.status(404).json({ error: 'Accesorio no encontrado o inactivo' });
    }
    const stock = producto.rows[0].stock;

    const idCarrito = await obtenerOCrearIdCarrito(req.usuario.id_usuario);
    const itemExistente = await pool.query(
      'SELECT id_item_carrito, cantidad FROM item_carrito WHERE id_carrito = $1 AND id_accesorio = $2',
      [idCarrito, idAccesorio]
    );
    const existente = itemExistente.rows[0];
    const nuevaCantidad = Number(cantidad) + (existente?.cantidad ?? 0);

    if (nuevaCantidad > stock) {
      return res.status(400).json({ error: 'La cantidad solicitada supera el stock disponible' });
    }

    if (existente) {
      await pool.query('UPDATE item_carrito SET cantidad = $1 WHERE id_item_carrito = $2', [nuevaCantidad, existente.id_item_carrito]);
    } else {
      await pool.query(
        'INSERT INTO item_carrito (id_carrito, id_accesorio, cantidad) VALUES ($1, $2, $3)',
        [idCarrito, idAccesorio, nuevaCantidad]
      );
    }

    res.status(201).json({ mensaje: 'Ítem agregado/actualizado en el carrito correctamente' });
  },

  // PUT /api/v1/carrito/items/:id (fija la cantidad de un ítem propio)
  async actualizarCantidad(req, res) {
    const { cantidad } = req.body;

    if (!enteroPositivo(cantidad)) {
      return res.status(400).json({ error: 'La cantidad debe ser un entero mayor a 0' });
    }

    // Solo encuentra el ítem si es del carrito del cliente logueado
    const item = await buscarItemDeCliente(req.params.id, req.usuario.id_usuario);
    if (!item) return res.status(404).json({ error: 'Ítem de carrito no encontrado' });

    if (Number(cantidad) > item.stock) {
      return res.status(400).json({ error: 'La cantidad solicitada supera el stock disponible' });
    }

    const result = await pool.query(
      'UPDATE item_carrito SET cantidad = $1 WHERE id_item_carrito = $2 RETURNING *',
      [cantidad, item.id_item_carrito]
    );
    res.json({ mensaje: 'Cantidad actualizada', item: result.rows[0] });
  },

  // DELETE /api/v1/carrito/items/:id (quita un ítem propio)
  async eliminarItem(req, res) {
    const item = await buscarItemDeCliente(req.params.id, req.usuario.id_usuario);
    if (!item) return res.status(404).json({ error: 'Ítem no encontrado en el carrito' });

    await pool.query('DELETE FROM item_carrito WHERE id_item_carrito = $1', [item.id_item_carrito]);
    res.status(204).send();
  },
};
