
import { Router } from 'express';
import { reservasController } from '../controllers/reservas.controller.js';
import { validarId } from '../middlewares/validarId.js';
import { verificarToken } from '../middlewares/verificarToken.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';

const router = Router();
router.param('id', validarId);

// Ruta pública (Cualquier cliente puede reservar una cita desde el formulario)
router.post('/', reservasController.crear);

// Rutas protegidas para Vendedores y Administradores
router.get('/', verificarToken, permitirRoles('VENDEDOR', 'ADMINISTRADOR'), reservasController.listar);
router.patch('/:id', verificarToken, permitirRoles('VENDEDOR', 'ADMINISTRADOR'), reservasController.cambiarEstado);

export default router;