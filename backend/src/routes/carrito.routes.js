import { Router } from 'express';
import { carritoController } from '../controllers/carrito.controller.js';
import { verificarToken } from '../middlewares/verificarToken.js';
import { permitirRoles } from '../middlewares/permitirRoles.js';

const router = Router();

// Todas las rutas requieren estar autenticado como CLIENTE
router.use(verificarToken, permitirRoles('CLIENTE'));

router.get('/', carritoController.obtenerCarrito);
router.post('/items', carritoController.agregarItem);
router.put('/items/:id', carritoController.actualizarCantidad);
router.delete('/items/:id', carritoController.eliminarItem);

export default router;