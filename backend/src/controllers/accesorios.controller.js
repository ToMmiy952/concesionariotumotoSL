import { pool, conTransaccion } from '../config/db.js';
import { errorEnCamposProducto } from '../middlewares/validaciones.js';

// SELECT base que comparten el listado y el detalle
const SELECT_ACCESORIO = `
  SELECT p.id_producto, p.marca, a.nombre, a.categoria, p.precio,
         p.descripcion, p.imagen, p.stock, a.talle, p.esta_activo
  FROM productos p
  INNER JOIN accesorios a ON p.id_producto = a.id_producto`;

export const accesoriosController = {
  // GET /api/v1/accesorios (público, filtro ?categoria=)
  async listar(req, res) {
    const { categoria } = req.query;
    const params = [];
    let query = `${SELECT_ACCESORIO} WHERE p.esta_activo = true AND p.tipo = 'ACCESORIO'`;

    if (categoria) {
      params.push(categoria);
      query += ` AND a.categoria = $${params.length}`;
    }

    const result = await pool.query(`${query} ORDER BY p.id_producto DESC`, params);
    res.json(result.rows);
  },

  // GET /api/v1/accesorios/:id (público)
  async obtenerPorId(req, res) {
    const result = await pool.query(
      `${SELECT_ACCESORIO} WHERE p.id_producto = $1 AND p.esta_activo = true AND p.tipo = 'ACCESORIO'`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Accesorio no encontrado' });
    res.json(result.rows[0]);
  },

  // POST /api/v1/accesorios (admin)
  async crear(req, res) {
    const { nombre, categoria, marca, precio, descripcion, imagen, stock = 0, talle } = req.body;

    if (!nombre || !categoria || precio === undefined) {
      return res.status(400).json({ error: 'Nombre, categoría y precio son obligatorios' });
    }
    const errorCampos = errorEnCamposProducto({ precio, stock });
    if (errorCampos) return res.status(400).json({ error: errorCampos });

    // productos + accesorios se guardan juntos: si falla uno, no se guarda ninguno
    const idProducto = await conTransaccion(async (db) => {
      const prod = await db.query(
        `INSERT INTO productos (marca, stock, descripcion, imagen, precio, tipo)
         VALUES ($1, $2, $3, $4, $5, 'ACCESORIO')
         RETURNING id_producto`,
        [marca || 'Genérica', stock, descripcion || null, imagen || null, precio]
      );
      const id = prod.rows[0].id_producto;

      await db.query(
        `INSERT INTO accesorios (id_producto, nombre, categoria, talle) VALUES ($1, $2, $3, $4)`,
        [id, nombre, categoria, talle || null]
      );
      return id;
    });

    res.status(201).json({ mensaje: 'Accesorio creado con éxito', id_producto: idProducto });
  },

  // PUT /api/v1/accesorios/:id (admin)
  async actualizar(req, res) {
    const errorCampos = errorEnCamposProducto({ precio: req.body.precio, stock: req.body.stock });
    if (errorCampos) return res.status(400).json({ error: errorCampos });

    const { nombre, categoria, marca, precio, descripcion, imagen, stock, talle } = req.body;

    const actualizado = await conTransaccion(async (db) => {
      const prod = await db.query(
        `UPDATE productos
         SET marca = COALESCE($1, marca),
             precio = COALESCE($2, precio),
             descripcion = COALESCE($3, descripcion),
             imagen = COALESCE($4, imagen),
             stock = COALESCE($5, stock)
         WHERE id_producto = $6 AND esta_activo = true AND tipo = 'ACCESORIO'
         RETURNING id_producto`,
        [marca, precio, descripcion, imagen, stock, req.params.id]
      );
      if (prod.rowCount === 0) return false;

      await db.query(
        `UPDATE accesorios
         SET nombre = COALESCE($1, nombre),
             categoria = COALESCE($2, categoria),
             talle = COALESCE($3, talle)
         WHERE id_producto = $4`,
        [nombre, categoria, talle, req.params.id]
      );
      return true;
    });

    if (!actualizado) return res.status(404).json({ error: 'Accesorio no encontrado para actualizar' });
    res.json({ mensaje: 'Accesorio actualizado correctamente' });
  },

  // DELETE /api/v1/accesorios/:id (admin, baja lógica)
  async eliminar(req, res) {
    const result = await pool.query(
      `UPDATE productos SET esta_activo = false WHERE id_producto = $1 AND esta_activo = true AND tipo = 'ACCESORIO'`,
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Accesorio no encontrado o ya dado de baja' });
    res.status(204).send();
  },
};
