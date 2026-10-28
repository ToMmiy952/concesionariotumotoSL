import { motosRepository } from '../repositories/motos.repository.js';
import { errorEnCamposProducto } from '../utils/validaciones.js';

export const motosController = {
  // GET /api/v1/motos (público, filtros ?marca= ?estado=)
  async listar(req, res) {
    res.json(await motosRepository.listar(req.query));
  },

  // GET /api/v1/motos/:id (público)
  async obtenerPorId(req, res) {
    const moto = await motosRepository.buscarPorId(req.params.id);
    if (!moto) return res.status(404).json({ error: 'Moto no encontrada' });
    res.json(moto);
  },

  // POST /api/v1/motos (admin)
  async crear(req, res) {
    const { marca, modelo, precio, cilindrada, descripcion, imagen, stock = 0 } = req.body;

    if (!marca || !modelo || precio === undefined) {
      return res.status(400).json({ error: 'Marca, modelo y precio son obligatorios' });
    }
    const errorCampos = errorEnCamposProducto({ precio, stock, cilindrada });
    if (errorCampos) return res.status(400).json({ error: errorCampos });

    const idProducto = await motosRepository.crear({ marca, modelo, precio, cilindrada, descripcion, imagen, stock });
    res.status(201).json({ mensaje: 'Moto creada con éxito', id_producto: idProducto });
  },

  // PUT /api/v1/motos/:id (admin)
  async actualizar(req, res) {
    const errorCampos = errorEnCamposProducto(req.body);
    if (errorCampos) return res.status(400).json({ error: errorCampos });

    const actualizada = await motosRepository.actualizar(req.params.id, req.body);
    if (!actualizada) return res.status(404).json({ error: 'Moto no encontrada para actualizar' });
    res.json({ mensaje: 'Moto actualizada correctamente' });
  },

  // DELETE /api/v1/motos/:id (admin, baja lógica)
  async eliminar(req, res) {
    const baja = await motosRepository.darDeBaja(req.params.id);
    if (!baja) return res.status(404).json({ error: 'Moto no encontrada o ya estaba dada de baja' });
    res.status(204).send();
  },
};
