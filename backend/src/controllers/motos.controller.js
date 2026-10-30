import { pool, conTransaccion } from '../config/db.js';
import { errorEnCamposProducto } from '../middlewares/validaciones.js';

// SELECT base que comparten el listado y el detalle
const SELECT_MOTO = `
  SELECT p.id_producto, p.marca, m.modelo, p.precio, m.cilindrada,
         p.descripcion, p.imagen, p.stock, m.estado, p.esta_activo
  FROM productos p
  INNER JOIN motos m ON p.id_producto = m.id_producto`;

export const motosController = {
  // GET /api/v1/motos (público, filtros ?marca= ?estado=)
  async listar(req, res) {
    const { marca, estado } = req.query;
    const params = [];
    let query = `${SELECT_MOTO} WHERE p.esta_activo = true`;

    if (marca) {
      params.push(`%${marca}%`);
      query += ` AND p.marca ILIKE $${params.length}`;
    }
    if (estado) {
      params.push(estado);
      query += ` AND m.estado = $${params.length}`;
    }

    const result = await pool.query(`${query} ORDER BY p.id_producto DESC`, params);
    res.json(result.rows);
  },

  // GET /api/v1/motos/:id (público)
  async obtenerPorId(req, res) {
    const result = await pool.query(`${SELECT_MOTO} WHERE p.id_producto = $1 AND p.esta_activo = true`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Moto no encontrada' });
    res.json(result.rows[0]);
  },

  // POST /api/v1/motos (admin)
  async crear(req, res) {
    const { marca, modelo, precio, cilindrada, descripcion, imagen, stock = 0 } = req.body;

    if (!marca || !modelo || precio === undefined) {
      return res.status(400).json({ error: 'Marca, modelo y precio son obligatorios' });
    }
    const errorCampos = errorEnCamposProducto({ precio, stock, cilindrada });
    if (errorCampos) return res.status(400).json({ error: errorCampos });

    // productos + motos se guardan juntos: si falla uno, no se guarda ninguno
    const idProducto = await conTransaccion(async (db) => {
      const prod = await db.query(
        `INSERT INTO productos (marca, stock, descripcion, imagen, precio, tipo)
         VALUES ($1, $2, $3, $4, $5, 'MOTO')
         RETURNING id_producto`,
        [marca, stock, descripcion || null, imagen || null, precio]
      );
      const id = prod.rows[0].id_producto;

      await db.query(
        `INSERT INTO motos (id_producto, modelo, cilindrada, estado) VALUES ($1, $2, $3, 'Disponible')`,
        [id, modelo, cilindrada || null]
      );
      return id;
    });

    res.status(201).json({ mensaje: 'Moto creada con éxito', id_producto: idProducto });
  },

  // PUT /api/v1/motos/:id (admin)
  async actualizar(req, res) {
    const errorCampos = errorEnCamposProducto(req.body);
    if (errorCampos) return res.status(400).json({ error: errorCampos });

    const { marca, modelo, precio, cilindrada, descripcion, imagen, stock, estado } = req.body;

    const actualizada = await conTransaccion(async (db) => {
      // COALESCE conserva el valor anterior cuando el campo no se envía
      const prod = await db.query(
        `UPDATE productos
         SET marca = COALESCE($1, marca),
             precio = COALESCE($2, precio),
             descripcion = COALESCE($3, descripcion),
             imagen = COALESCE($4, imagen),
             stock = COALESCE($5, stock)
         WHERE id_producto = $6 AND esta_activo = true AND tipo = 'MOTO'
         RETURNING id_producto`,
        [marca, precio, descripcion, imagen, stock, req.params.id]
      );
      if (prod.rowCount === 0) return false;

      await db.query(
        `UPDATE motos
         SET modelo = COALESCE($1, modelo),
             cilindrada = COALESCE($2, cilindrada),
             estado = COALESCE($3, estado)
         WHERE id_producto = $4`,
        [modelo, cilindrada, estado, req.params.id]
      );
      return true;
    });

    if (!actualizada) return res.status(404).json({ error: 'Moto no encontrada para actualizar' });
    res.json({ mensaje: 'Moto actualizada correctamente' });
  },

  // DELETE /api/v1/motos/:id (admin, baja lógica)
  async eliminar(req, res) {
    const result = await pool.query(
      `UPDATE productos SET esta_activo = false WHERE id_producto = $1 AND esta_activo = true AND tipo = 'MOTO'`,
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Moto no encontrada o ya estaba dada de baja' });
    res.status(204).send();
  },
};
