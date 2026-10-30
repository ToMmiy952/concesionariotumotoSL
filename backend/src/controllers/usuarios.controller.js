import { pool } from '../config/db.js';

const ROLES = ['CLIENTE', 'VENDEDOR', 'ADMINISTRADOR'];

export const usuariosController = {
  // GET /api/v1/usuarios (admin, filtro ?rol=). Nunca devuelve la contraseña
  async listar(req, res) {
    const rol = req.query.rol?.trim().toUpperCase();
    if (rol && !ROLES.includes(rol)) {
      return res.status(400).json({ error: `Rol no válido. Valores posibles: ${ROLES.join(', ')}` });
    }

    const params = [];
    let query = 'SELECT id_usuario, nombre, email, rol, esta_activo FROM usuarios';
    if (rol) {
      params.push(rol);
      query += ' WHERE rol = $1';
    }

    const result = await pool.query(`${query} ORDER BY id_usuario`, params);
    res.json(result.rows);
  },

  // PATCH /api/v1/usuarios/:id/activo (admin: activa o desactiva una cuenta)
  async cambiarActivo(req, res) {
    const { activo } = req.body;
    if (typeof activo !== 'boolean') {
      return res.status(400).json({ error: 'El campo activo es obligatorio y debe ser true o false' });
    }
    if (Number(req.params.id) === req.usuario.id_usuario && !activo) {
      return res.status(400).json({ error: 'No podés desactivar tu propia cuenta' });
    }

    const result = await pool.query(
      `UPDATE usuarios SET esta_activo = $1 WHERE id_usuario = $2
       RETURNING id_usuario, nombre, email, rol, esta_activo`,
      [activo, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  },
};
