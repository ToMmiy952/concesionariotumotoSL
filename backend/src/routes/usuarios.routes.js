import { Router } from 'express';
import { usuariosController } from '../controllers/usuarios.controller.js';
import { validarId } from '../middlewares/validarId.js';
import { verificarToken } from '../middlewares/verificarToken.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';

const router = Router();
router.param('id', validarId);

// La gestión de cuentas es exclusiva del administrador
router.patch('/:id/activo', verificarToken, permitirRoles('ADMINISTRADOR'), usuariosController.cambiarActivo);

export default router;
