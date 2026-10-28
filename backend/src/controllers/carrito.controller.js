import { carritoRepository } from '../repositories/carrito.repository.js';
import { enteroPositivo } from '../utils/validaciones.js';

export const carritoController = {
  // GET /api/v1/carrito (carrito del cliente autenticado; se crea si todavía no tiene)
  async obtenerCarrito(req, res) {
    const idCarrito = await carritoRepository.obtenerOCrearId(req.usuario.id_usuario);
    const items = await carritoRepository.listarItems(idCarrito);

    res.json({
      id_carrito: idCarrito,
      items,
      total: items.reduce((acc, item) => acc + Number(item.subtotal), 0),
    });
  },

  // POST /api/v1/carrito/items (agrega un accesorio o suma cantidad si ya estaba)
  async agregarItem(req, res) {
    const { idAccesorio, cantidad = 1 } = req.body;

    if (!enteroPositivo(idAccesorio) || !enteroPositivo(cantidad)) {
      return res.status(400).json({ error: 'Debes proporcionar un idAccesorio válido y una cantidad entera mayor a 0' });
    }

    const stock = await carritoRepository.stockAccesorio(idAccesorio);
    if (stock === null) {
      return res.status(404).json({ error: 'Accesorio no encontrado o inactivo' });
    }

    const idCarrito = await carritoRepository.obtenerOCrearId(req.usuario.id_usuario);
    const existente = await carritoRepository.buscarItemPorAccesorio(idCarrito, idAccesorio);
    const nuevaCantidad = Number(cantidad) + (existente?.cantidad ?? 0);

    if (nuevaCantidad > stock) {
      return res.status(400).json({ error: 'La cantidad solicitada supera el stock disponible' });
    }

    if (existente) {
      await carritoRepository.actualizarCantidad(existente.id_item_carrito, nuevaCantidad);
    } else {
      await carritoRepository.insertarItem(idCarrito, idAccesorio, nuevaCantidad);
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
    const item = await carritoRepository.buscarItemDeCliente(req.params.id, req.usuario.id_usuario);
    if (!item) return res.status(404).json({ error: 'Ítem de carrito no encontrado' });

    if (Number(cantidad) > item.stock) {
      return res.status(400).json({ error: 'La cantidad solicitada supera el stock disponible' });
    }

    const actualizado = await carritoRepository.actualizarCantidad(item.id_item_carrito, cantidad);
    res.json({ mensaje: 'Cantidad actualizada', item: actualizado });
  },

  // DELETE /api/v1/carrito/items/:id (quita un ítem propio)
  async eliminarItem(req, res) {
    const item = await carritoRepository.buscarItemDeCliente(req.params.id, req.usuario.id_usuario);
    if (!item) return res.status(404).json({ error: 'Ítem no encontrado en el carrito' });

    await carritoRepository.eliminarItem(item.id_item_carrito);
    res.status(204).send();
  },
};
