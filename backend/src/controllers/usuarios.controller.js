import bcrypt from 'bcryptjs';
import { pool, conTransaccion } from '../config/db.js';
import { emailValido } from '../middlewares/validaciones.js';

export const usuariosController = {
  // GET /api/v1/usuarios/vendedores (admin: lista de vendedores, activos e inactivos)
  async listarVendedores(req, res) {
    const result = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.email, u.esta_activo, v.fecha_contratacion
       FROM vendedores v
       INNER JOIN usuarios u ON u.id_usuario = v.id_usuario
       ORDER BY u.esta_activo DESC, u.nombre`
    );
    res.json(result.rows);
  },

  // POST /api/v1/usuarios/vendedores (admin: da de alta un vendedor)
  async crearVendedor(req, res) {
    const { nombre, email, password } = req.body;

    if (!nombre || !String(nombre).trim() || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
    }
    if (!emailValido(email)) {
      return res.status(400).json({ error: 'El email no tiene un formato válido' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // La contraseña se guarda hasheada, nunca en texto plano
    const passwordHash = await bcrypt.hash(String(password), 10);

    // usuarios + vendedores se guardan juntos: si falla uno, no se guarda ninguno
    try {
      const vendedor = await conTransaccion(async (db) => {
        const nuevo = await db.query(
          `INSERT INTO usuarios (nombre, email, password, rol)
           VALUES ($1, $2, $3, 'VENDEDOR')
           RETURNING id_usuario, nombre, email, esta_activo`,
          [String(nombre).trim(), email, passwordHash]
        );
        const alta = await db.query(
          `INSERT INTO vendedores (id_usuario, fecha_contratacion) VALUES ($1, CURRENT_DATE)
           RETURNING fecha_contratacion`,
          [nuevo.rows[0].id_usuario]
        );
        return { ...nuevo.rows[0], fecha_contratacion: alta.rows[0].fecha_contratacion };
      });
      res.status(201).json(vendedor);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Ya existe una cuenta registrada con este email' });
      }
      throw error;
    }
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
