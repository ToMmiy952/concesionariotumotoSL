import { accesoriosRepository } from '../repositories/accesorios.repository.js';
import { errorEnCamposProducto } from '../utils/validaciones.js';

export const accesoriosController = {
  // GET /api/v1/accesorios (público, filtro ?categoria=)
  async listar(req, res) {
    res.json(await accesoriosRepository.listar(req.query));
  },

  // GET /api/v1/accesorios/:id (público)
  async obtenerPorId(req, res) {
    const accesorio = await accesoriosRepository.buscarPorId(req.params.id);
    if (!accesorio) return res.status(404).json({ error: 'Accesorio no encontrado' });
    res.json(accesorio);
  },

  // POST /api/v1/accesorios (admin)
  async crear(req, res) {
    const { nombre, categoria, marca, precio, descripcion, imagen, stock = 0, talle } = req.body;

    if (!nombre || !categoria || precio === undefined) {
      return res.status(400).json({ error: 'Nombre, categoría y precio son obligatorios' });
    }
    const errorCampos = errorEnCamposProducto({ precio, stock });
    if (errorCampos) return res.status(400).json({ error: errorCampos });

    const idProducto = await accesoriosRepository.crear({ nombre, categoria, marca, precio, descripcion, imagen, stock, talle });
    res.status(201).json({ mensaje: 'Accesorio creado con éxito', id_producto: idProducto });
  },

  // PUT /api/v1/accesorios/:id (admin)
  async actualizar(req, res) {
    const errorCampos = errorEnCamposProducto({ precio: req.body.precio, stock: req.body.stock });
    if (errorCampos) return res.status(400).json({ error: errorCampos });

    const actualizado = await accesoriosRepository.actualizar(req.params.id, req.body);
    if (!actualizado) return res.status(404).json({ error: 'Accesorio no encontrado para actualizar' });
    res.json({ mensaje: 'Accesorio actualizado correctamente' });
  },

  // DELETE /api/v1/accesorios/:id (admin, baja lógica)
  async eliminar(req, res) {
    const baja = await accesoriosRepository.darDeBaja(req.params.id);
    if (!baja) return res.status(404).json({ error: 'Accesorio no encontrado o ya dado de baja' });
    res.status(204).send();
  },
};
