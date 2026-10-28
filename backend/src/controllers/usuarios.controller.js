import { usuariosRepository } from '../repositories/usuarios.repository.js';

const ROLES = ['CLIENTE', 'VENDEDOR', 'ADMINISTRADOR'];

export const usuariosController = {
  // GET /api/v1/usuarios (admin, filtro ?rol=)
  async listar(req, res) {
    const rol = req.query.rol?.trim().toUpperCase();
    if (rol && !ROLES.includes(rol)) {
      return res.status(400).json({ error: `Rol no válido. Valores posibles: ${ROLES.join(', ')}` });
    }
    res.json(await usuariosRepository.listar({ rol }));
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

    const usuario = await usuariosRepository.cambiarActivo(req.params.id, activo);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  },
};
