import { pool, conTransaccion } from '../config/db.js';

export const usuariosRepository = {
  async buscarPorEmail(email) {
    const result = await pool.query(
      'SELECT id_usuario, nombre, email, password, rol, esta_activo FROM usuarios WHERE email = $1',
      [email]
    );
    return result.rows[0] ?? null;
  },

  // Lista usuarios (sin contraseña), con filtro opcional por rol
  async listar({ rol }) {
    const params = [];
    let query = 'SELECT id_usuario, nombre, email, rol, esta_activo FROM usuarios';
    if (rol) {
      params.push(rol);
      query += ' WHERE rol = $1';
    }
    const result = await pool.query(`${query} ORDER BY id_usuario`, params);
    return result.rows;
  },

  // Activa o desactiva una cuenta (baja lógica). Devuelve el usuario actualizado o null si no existe
  async cambiarActivo(id, activo) {
    const result = await pool.query(
      `UPDATE usuarios SET esta_activo = $1 WHERE id_usuario = $2
       RETURNING id_usuario, nombre, email, rol, esta_activo`,
      [activo, id]
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
