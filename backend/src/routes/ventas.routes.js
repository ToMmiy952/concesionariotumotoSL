import { Router } from 'express';
import { ventasController } from '../controllers/ventas.controller.js';
import { validarId } from '../middlewares/validarId.js';
import { verificarToken } from '../middlewares/verificarToken.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';

const router = Router();
router.param('id', validarId);

// Todas las rutas de ventas requieren sesión
router.use(verificarToken);

router.post('/online', permitirRoles('CLIENTE'), ventasController.crearOnline);
router.post('/motos', permitirRoles('VENDEDOR'), ventasController.crearMoto);
router.get('/', permitirRoles('CLIENTE', 'VENDEDOR', 'ADMINISTRADOR'), ventasController.listar);
router.get('/:id', permitirRoles('CLIENTE', 'VENDEDOR', 'ADMINISTRADOR'), ventasController.obtenerPorId);

export default router;
