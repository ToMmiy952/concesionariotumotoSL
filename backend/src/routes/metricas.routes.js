import { Router } from 'express';
import { metricasController } from '../controllers/metricas.controller.js';
import { verificarToken } from '../middlewares/verificarToken.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';

const router = Router();

router.get('/vendedor', verificarToken, permitirRoles('VENDEDOR'), metricasController.deVendedor);
router.get('/admin', verificarToken, permitirRoles('ADMINISTRADOR'), metricasController.deAdmin);

export default router;
