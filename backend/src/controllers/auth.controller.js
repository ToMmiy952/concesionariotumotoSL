import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';

export const authController = {
  // 1. Registro de usuarios (Clientes o Vendedores)
  async registrar(req, res, next) {
    const { nombre, email, password, rol = 'CLIENTE', telefono, direccion, cod_postal, provincia } = req.body;

    try {
      // Validaciones básicas de campos obligatorios
      if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
      }

      // Hashear la contraseña antes de guardarla
      const passwordHash = await bcrypt.hash(password, 10);

      // Iniciar transacción SQL para insertar en usuarios y en la tabla hija correspondiente
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Insertar usuario padre
        const userResult = await client.query(
          `INSERT INTO usuarios (nombre, email, password_hash, rol)
           VALUES ($1, $2, $3, $4)
           RETURNING id_usuario, nombre, email, rol, esta_activo`,
          [nombre, email, passwordHash, rol]
        );

        const nuevoUsuario = userResult.rows[0];

        // Insertar datos extendidos si es cliente
        if (rol === 'CLIENTE') {
          await client.query(
            `INSERT INTO clientes (id_usuario, telefono, direccion, cod_postal, provincia)
             VALUES ($1, $2, $3, $4, $5)`,
            [nuevoUsuario.id_usuario, telefono || null, direccion || '', cod_postal || 0, provincia || '']
          );
        }

        await client.query('COMMIT');

        return res.status(201).json({
          mensaje: 'Usuario registrado con éxito',
          usuario: nuevoUsuario
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (error) {
      
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Ya existe una cuenta registrada con este email' });
      }
      next(error);
    }
  },

  //  Iniciar Sesión 
  async login(req, res, next) {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
      }

      // Buscar al usuario por email en PostgreSQL
      const result = await pool.query(
        'SELECT id_usuario, nombre, email, password_hash, rol, esta_activo FROM usuarios WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const usuario = result.rows[0];

      if (!usuario.esta_activo) {
        return res.status(403).json({ error: 'La cuenta se encuentra desactivada' });
      }

      // Comparar contraseña plana ingresada contra el hash guardado
      const esValida = await bcrypt.compare(password, usuario.password_hash);
      if (!esValida) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Firmar el Token con datos minimos, nunca usar la contraseña 
      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          email: usuario.email,
          rol: usuario.rol
        },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      );

      return res.json({
        mensaje: 'Inicio de sesión exitoso',
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      });
    } catch (error) {
      next(error);
    }
  }
};