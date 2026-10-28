import { pool, conTransaccion } from '../config/db.js';

const SELECT_MOTO = `
  SELECT p.id_producto, p.marca, m.modelo, p.precio, m.cilindrada,
         p.descripcion, p.imagen, p.stock, m.estado, p.esta_activo
  FROM productos p
  INNER JOIN motos m ON p.id_producto = m.id_producto`;

export const motosRepository = {
  async listar({ marca, estado }) {
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
    return result.rows;
  },

  async buscarPorId(id) {
    const result = await pool.query(`${SELECT_MOTO} WHERE p.id_producto = $1 AND p.esta_activo = true`, [id]);
    return result.rows[0] ?? null;
  },

  async crear({ marca, modelo, precio, cilindrada, descripcion, imagen, stock }) {
    return conTransaccion(async (db) => {
      const prod = await db.query(
        `INSERT INTO productos (marca, stock, descripcion, imagen, precio, tipo)
         VALUES ($1, $2, $3, $4, $5, 'MOTO')
         RETURNING id_producto`,
        [marca, stock, descripcion || null, imagen || null, precio]
      );
      const idProducto = prod.rows[0].id_producto;

      await db.query(
        `INSERT INTO motos (id_producto, modelo, cilindrada, estado) VALUES ($1, $2, $3, 'Disponible')`,
        [idProducto, modelo, cilindrada || null]
      );
      return idProducto;
    });
  },

  // Devuelve false si la moto no existe o está dada de baja
  async actualizar(id, { marca, modelo, precio, cilindrada, descripcion, imagen, stock, estado }) {
    return conTransaccion(async (db) => {
      const prod = await db.query(
        `UPDATE productos
         SET marca = COALESCE($1, marca),
             precio = COALESCE($2, precio),
             descripcion = COALESCE($3, descripcion),
             imagen = COALESCE($4, imagen),
             stock = COALESCE($5, stock)
         WHERE id_producto = $6 AND esta_activo = true AND tipo = 'MOTO'
         RETURNING id_producto`,
        [marca, precio, descripcion, imagen, stock, id]
      );
      if (prod.rowCount === 0) return false;

      await db.query(
        `UPDATE motos
         SET modelo = COALESCE($1, modelo),
             cilindrada = COALESCE($2, cilindrada),
             estado = COALESCE($3, estado)
         WHERE id_producto = $4`,
        [modelo, cilindrada, estado, id]
      );
      return true;
    });
  },

  // Baja lógica. Devuelve false si no existe o ya estaba dada de baja
  async darDeBaja(id) {
    const result = await pool.query(
      `UPDATE productos SET esta_activo = false WHERE id_producto = $1 AND esta_activo = true AND tipo = 'MOTO'`,
      [id]
    );
    return result.rowCount > 0;
  },
};
