import { pool } from '../config/db.js';

export const accesoriosController = {
  // 1. GET /api/v1/accesorios (Vidriera pública con filtro opcional por categoría)
  async listar(req, res, next) {
    const { categoria } = req.query;

    try {
      let query = `
        SELECT p.id_producto, p.marca, a.nombre, a.categoria, p.precio, 
               p.descripcion, p.imagen, p.stock, a.talle, p.esta_activo
        FROM productos p
        INNER JOIN accesorios a ON p.id_producto = a.id_producto
        WHERE p.esta_activo = true AND p.tipo = 'ACCESORIO'
      `;
      const params = [];

      if (categoria) {
        params.push(categoria);
        query += ` AND a.categoria = $${params.length}`;
      }

      query += ` ORDER BY p.id_producto DESC`;

      const result = await pool.query(query, params);
      return res.json(result.rows);
    } catch (error) {
      next(error);
    }
  },

  // 2. GET /api/v1/accesorios/:id (Obtener detalle de un accesorio)
  async obtenerPorId(req, res, next) {
    const { id } = req.params;

    try {
      const result = await pool.query(
        `SELECT p.id_producto, p.marca, a.nombre, a.categoria, p.precio, 
                p.descripcion, p.imagen, p.stock, a.talle, p.esta_activo
         FROM productos p
         INNER JOIN accesorios a ON p.id_producto = a.id_producto
         WHERE p.id_producto = $1 AND p.esta_activo = true AND p.tipo = 'ACCESORIO'`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Accesorio no encontrado' });
      }

      return res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  // 3. POST /api/v1/accesorios (Alta de accesorio - Exclusivo Admin)
  async crear(req, res, next) {
    const { nombre, categoria, marca, precio, descripcion, imagen, stock = 0, talle } = req.body;

    if (!nombre || !categoria || !precio) {
      return res.status(400).json({ error: 'Nombre, categoría y precio son obligatorios' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const prodResult = await client.query(
        `INSERT INTO productos (marca, stock, descripcion, imagen, precio, tipo)
         VALUES ($1, $2, $3, $4, $5, 'ACCESORIO')
         RETURNING id_producto`,
        [marca || 'Genérica', stock, descripcion || null, imagen || null, precio]
      );

      const idProducto = prodResult.rows[0].id_producto;

      await client.query(
        `INSERT INTO accesorios (id_producto, nombre, categoria, talle)
         VALUES ($1, $2, $3, $4)`,
        [idProducto, nombre, categoria, talle || null]
      );

      await client.query('COMMIT');

      return res.status(201).json({
        mensaje: 'Accesorio creado con éxito',
        id_producto: idProducto
      });
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  },

  // 4. PUT /api/v1/accesorios/:id (Modificar accesorio - Exclusivo Admin)
  async actualizar(req, res, next) {
    const { id } = req.params;
    const { nombre, categoria, marca, precio, descripcion, imagen, stock, talle } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const prodResult = await client.query(
        `UPDATE productos 
         SET marca = COALESCE($1, marca),
             precio = COALESCE($2, precio),
             descripcion = COALESCE($3, descripcion),
             imagen = COALESCE($4, imagen),
             stock = COALESCE($5, stock)
         WHERE id_producto = $6 AND esta_activo = true AND tipo = 'ACCESORIO'
         RETURNING id_producto`,
        [marca, precio, descripcion, imagen, stock, id]
      );

      if (prodResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Accesorio no encontrado para actualizar' });
      }

      await client.query(
        `UPDATE accesorios 
         SET nombre = COALESCE($1, nombre),
             categoria = COALESCE($2, categoria),
             talle = COALESCE($3, talle)
         WHERE id_producto = $4`,
        [nombre, categoria, talle, id]
      );

      await client.query('COMMIT');
      return res.json({ mensaje: 'Accesorio actualizado correctamente' });
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  },

  // 5. DELETE /api/v1/accesorios/:id (Baja lógica - Exclusivo Admin)
  async eliminar(req, res, next) {
    const { id } = req.params;

    try {
      const result = await pool.query(
        `UPDATE productos SET esta_activo = false WHERE id_producto = $1 AND esta_activo = true AND tipo = 'ACCESORIO'`,
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Accesorio no encontrado o ya dado de baja' });
      }

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};