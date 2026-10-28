import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { usuariosRepository } from '../repositories/usuarios.repository.js';
import { emailValido } from '../utils/validaciones.js';

export const authController = {
  // POST /api/v1/auth/registro (público: solo crea clientes; vendedores y admins los da de alta el admin)
  async registrar(req, res) {
    const { nombre, email, password, telefono, direccion, cod_postal, provincia } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
    }
    if (!emailValido(email)) {
      return res.status(400).json({ error: 'El email no tiene un formato válido' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    if (cod_postal !== undefined && !(Number.isInteger(cod_postal) && cod_postal >= 0 && cod_postal <= 99999)) {
      return res.status(400).json({ error: 'El código postal debe ser un número válido' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const usuario = await usuariosRepository.crearCliente({
        nombre, email, passwordHash, telefono, direccion, cod_postal, provincia,
      });
      res.status(201).json({ mensaje: 'Usuario registrado con éxito', usuario });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Ya existe una cuenta registrada con este email' });
      }
      throw error;
    }
  },

  // POST /api/v1/auth/login
  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const usuario = await usuariosRepository.buscarPorEmail(email);

    // Mismo mensaje si el email no existe o la contraseña es incorrecta, para no revelar qué cuentas existen
    const esValida = usuario && await bcrypt.compare(String(password), usuario.password);
    if (!esValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!usuario.esta_activo) {
      return res.status(403).json({ error: 'La cuenta se encuentra desactivada' });
    }

    // El token lleva solo lo mínimo, nunca la contraseña
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, email: usuario.email, rol: usuario.rol },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  },
};
