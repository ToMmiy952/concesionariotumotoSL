import { Router } from 'express';
import { motosController } from '../controllers/motos.controller.js';
import { verificarToken } from '../middlewares/verificarToken.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';

const router = Router();

// 1. Rutas Públicas (Vidriera y Detalle de Motos)
router.get('/', motosController.listar);
router.get('/:id', motosController.obtenerPorId);

// 2. Rutas Protegidas (Alta, Edición y Baja Lógica - Exclusivo Administrador)
router.post('/', verificarToken, permitirRoles('ADMINISTRADOR'), motosController.crear);
router.put('/:id', verificarToken, permitirRoles('ADMINISTRADOR'), motosController.actualizar);
router.delete('/:id', verificarToken, permitirRoles('ADMINISTRADOR'), motosController.eliminar);

export default router;