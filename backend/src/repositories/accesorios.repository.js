import { pool, conTransaccion } from '../config/db.js';

const SELECT_ACCESORIO = `
  SELECT p.id_producto, p.marca, a.nombre, a.categoria, p.precio,
         p.descripcion, p.imagen, p.stock, a.talle, p.esta_activo
  FROM productos p
  INNER JOIN accesorios a ON p.id_producto = a.id_producto`;

export const accesoriosRepository = {
  async listar({ categoria }) {
    const params = [];
    let query = `${SELECT_ACCESORIO} WHERE p.esta_activo = true AND p.tipo = 'ACCESORIO'`;

    if (categoria) {
      params.push(categoria);
      query += ` AND a.categoria = $${params.length}`;
    }

    const result = await pool.query(`${query} ORDER BY p.id_producto DESC`, params);
    return result.rows;
  },

  async buscarPorId(id) {
    const result = await pool.query(
      `${SELECT_ACCESORIO} WHERE p.id_producto = $1 AND p.esta_activo = true AND p.tipo = 'ACCESORIO'`,
      [id]
    );
    return result.rows[0] ?? null;
  },

  async crear({ nombre, categoria, marca, precio, descripcion, imagen, stock, talle }) {
    return conTransaccion(async (db) => {
      const prod = await db.query(
        `INSERT INTO productos (marca, stock, descripcion, imagen, precio, tipo)
         VALUES ($1, $2, $3, $4, $5, 'ACCESORIO')
         RETURNING id_producto`,
        [marca || 'Genérica', stock, descripcion || null, imagen || null, precio]
      );
      const idProducto = prod.rows[0].id_producto;

      await db.query(
        `INSERT INTO accesorios (id_producto, nombre, categoria, talle) VALUES ($1, $2, $3, $4)`,
        [idProducto, nombre, categoria, talle || null]
      );
      return idProducto;
    });
  },

  // Devuelve false si el accesorio no existe o está dado de baja
  async actualizar(id, { nombre, categoria, marca, precio, descripcion, imagen, stock, talle }) {
    return conTransaccion(async (db) => {
      const prod = await db.query(
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
      if (prod.rowCount === 0) return false;

      await db.query(
        `UPDATE accesorios
         SET nombre = COALESCE($1, nombre),
             categoria = COALESCE($2, categoria),
             talle = COALESCE($3, talle)
         WHERE id_producto = $4`,
        [nombre, categoria, talle, id]
      );
      return true;
    });
  },

  async darDeBaja(id) {
    const result = await pool.query(
      `UPDATE productos SET esta_activo = false WHERE id_producto = $1 AND esta_activo = true AND tipo = 'ACCESORIO'`,
      [id]
    );
    return result.rowCount > 0;
  },
};
