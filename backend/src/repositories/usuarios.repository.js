import { pool, conTransaccion } from '../config/db.js';

export const usuariosRepository = {
  async buscarPorEmail(email) {
    const result = await pool.query(
      'SELECT id_usuario, nombre, email, password, rol, esta_activo FROM usuarios WHERE email = $1',
      [email]
    );
    return result.rows[0] ?? null;
  },

  // Crea el usuario y su fila de cliente en una sola transacción. Si el email ya existe lanza el error 23505 de PostgreSQL
  async crearCliente({ nombre, email, passwordHash, telefono, direccion, cod_postal, provincia }) {
    return conTransaccion(async (db) => {
      const usuario = await db.query(
        `INSERT INTO usuarios (nombre, email, password, rol)
         VALUES ($1, $2, $3, 'CLIENTE')
         RETURNING id_usuario, nombre, email, rol, esta_activo`,
        [nombre, email, passwordHash]
      );
      const nuevo = usuario.rows[0];

      await db.query(
        `INSERT INTO clientes (id_usuario, telefono, direccion, cod_postal, provincia)
         VALUES ($1, $2, $3, $4, $5)`,
        [nuevo.id_usuario, telefono || null, direccion || 'Sin especificar', cod_postal || 0, provincia || 'Sin especificar']
      );
      return nuevo;
    });
  },
};
