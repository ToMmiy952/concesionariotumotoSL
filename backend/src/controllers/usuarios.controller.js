import { pool } from '../config/db.js';

export const usuariosController = {
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
