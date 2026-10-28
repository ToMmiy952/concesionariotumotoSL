import { Router } from 'express';
import { usuariosController } from '../controllers/usuarios.controller.js';
import { validarId } from '../middlewares/validarId.js';
import { verificarToken } from '../middlewares/verificarToken.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';

const router = Router();
router.param('id', validarId);

// Toda la gestión de usuarios es exclusiva del administrador
router.use(verificarToken, permitirRoles('ADMINISTRADOR'));

router.get('/', usuariosController.listar);
router.patch('/:id/activo', usuariosController.cambiarActivo);

export default router;
