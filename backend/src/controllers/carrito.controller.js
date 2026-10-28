import { pool } from '../config/db.js';

export const carritoController = {
  // 1. GET /api/v1/carrito (Obtener el carrito activo del cliente autenticado)
  async obtenerCarrito(req, res, next) {
    const id_cliente = req.usuario.id_usuario; // Extraído del token JWT por verificarToken

    try {
      // 1. Buscar o crear la cabecera del carrito para este cliente
      let carritoRes = await pool.query(
        `SELECT id_carrito FROM carritos WHERE id_cliente = $1`,
        [id_cliente]
      );

      let id_carrito;
      if (carritoRes.rows.length === 0) {
        // Si no existe, creamos el carrito automáticamente
        const nuevoCarrito = await pool.query(
          `INSERT INTO carritos (id_cliente) VALUES ($1) RETURNING id_carrito`,
          [id_cliente]
        );
        id_carrito = nuevoCarrito.rows[0].id_carrito;
      } else {
        id_carrito = carritoRes.rows[0].id_carrito;
      }

      // 2. Obtener los ítems asociados al carrito con JOIN a productos y accesorios
      const itemsRes = await pool.query(
        `SELECT ic.id_item_carrito, ic.id_accesorio, a.nombre, p.precio, 
                p.imagen, a.talle, ic.cantidad, (p.precio * ic.cantidad) AS subtotal
         FROM item_carrito ic
         INNER JOIN accesorios a ON ic.id_accesorio = a.id_producto
         INNER JOIN productos p ON a.id_producto = p.id_producto
         WHERE ic.id_carrito = $1 AND p.esta_activo = true`,
        [id_carrito]
      );

      return res.json({
        id_carrito,
        items: itemsRes.rows,
        total: itemsRes.rows.reduce((acc, item) => acc + Number(item.subtotal), 0)
      });
    } catch (error) {
      next(error);
    }
  },

  // 2. POST /api/v1/carrito/items (Agregar o incrementar cantidad de un accesorio)
  async agregarItem(req, res, next) {
    const id_cliente = req.usuario.id_usuario;
    const { idAccesorio, cantidad = 1 } = req.body;

    if (!idAccesorio || cantidad <= 0) {
      return res.status(400).json({ error: 'Debes proporcionar un idAccesorio válido y una cantidad mayor a 0' });
    }

    try {
      // 1. Verificar stock del accesorio
      const prodRes = await pool.query(
        `SELECT stock FROM productos WHERE id_producto = $1 AND tipo = 'ACCESORIO' AND esta_activo = true`,
        [idAccesorio]
      );

      if (prodRes.rows.length === 0) {
        return res.status(404).json({ error: 'Accesorio no encontrado o inactivo' });
      }

      // 2. Garantizar que existe el carrito cabecera
      let carritoRes = await pool.query(
        `SELECT id_carrito FROM carritos WHERE id_cliente = $1`,
        [id_cliente]
      );

      let id_carrito;
      if (carritoRes.rows.length === 0) {
        const nuevoCarrito = await pool.query(
          `INSERT INTO carritos (id_cliente) VALUES ($1) RETURNING id_carrito`,
          [id_cliente]
        );
        id_carrito = nuevoCarrito.rows[0].id_carrito;
      } else {
        id_carrito = carritoRes.rows[0].id_carrito;
      }

      // 3. Evaluar si el producto ya existe en el carrito
      const itemExistente = await pool.query(
        `SELECT id_item_carrito, cantidad FROM item_carrito WHERE id_carrito = $1 AND id_accesorio = $2`,
        [id_carrito, idAccesorio]
      );

      if (itemExistente.rows.length > 0) {
        // Incrementar cantidad
        const nuevaCantidad = itemExistente.rows[0].cantidad + cantidad;
        if (nuevaCantidad > prodRes.rows[0].stock) {
          return res.status(400).json({ error: 'La cantidad solicitada supera el stock disponible' });
        }

        await pool.query(
          `UPDATE item_carrito SET cantidad = $1 WHERE id_item_carrito = $2`,
          [nuevaCantidad, itemExistente.rows[0].id_item_carrito]
        );
      } else {
        // Insertar nuevo ítem
        if (cantidad > prodRes.rows[0].stock) {
          return res.status(400).json({ error: 'La cantidad solicitada supera el stock disponible' });
        }

        await pool.query(
          `INSERT INTO item_carrito (id_carrito, id_accesorio, cantidad) VALUES ($1, $2, $3)`,
          [id_carrito, idAccesorio, cantidad]
        );
      }

      return res.status(201).json({ mensaje: 'Ítem agregado/actualizado en el carrito correctamente' });
    } catch (error) {
      next(error);
    }
  },

  // 3. PUT /api/v1/carrito/items/:id (Modificar cantidad fija de un ítem)
  async actualizarCantidad(req, res, next) {
    const { id } = req.params; // id_item_carrito
    const { cantidad } = req.body;

    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
    }

    try {
      const result = await pool.query(
        `UPDATE item_carrito SET cantidad = $1 WHERE id_item_carrito = $2 RETURNING *`,
        [cantidad, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Ítem de carrito no encontrado' });
      }

      return res.json({ mensaje: 'Cantidad actualizada', item: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  // 4. DELETE /api/v1/carrito/items/:id (Quitar un ítem del carrito)
  async eliminarItem(req, res, next) {
    const { id } = req.params; // id_item_carrito

    try {
      const result = await pool.query(
        `DELETE FROM item_carrito WHERE id_item_carrito = $1`,
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Ítem no encontrado en el carrito' });
      }

      return res.status(200).json({ mensaje: 'Ítem eliminado del carrito' });
    } catch (error) {
      next(error);
    }
  }
};