import { Router } from 'express';
import { accesoriosController } from '../controllers/accesorios.controller.js';
import { validarId } from '../middlewares/validarId.js';
import { verificarToken } from '../middlewares/verificarToken.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';

const router = Router();
router.param('id', validarId);

// Rutas Públicas (Catálogo y Detalle)
router.get('/', accesoriosController.listar);
router.get('/:id', accesoriosController.obtenerPorId);

// Rutas Protegidas (Exclusivo Administrador)
router.post('/', verificarToken, permitirRoles('ADMINISTRADOR'), accesoriosController.crear);
router.put('/:id', verificarToken, permitirRoles('ADMINISTRADOR'), accesoriosController.actualizar);
router.delete('/:id', verificarToken, permitirRoles('ADMINISTRADOR'), accesoriosController.eliminar);

export default router;