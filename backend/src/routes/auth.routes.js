import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { verificarToken } from '../middlewares/verificarToken.js';

const router = Router();

// Rutas Públicas (no llevan verificarToken)
router.post('/registro', authController.registrar);
router.post('/login', authController.login);

// Ruta Protegida (pide token JWT en la cabecera), osea, cada vez que  se quiera acceder a esta ruta se va enviar el token
router.get('/perfil', verificarToken, (req, res) => {
  // Gracias a verificarToken, los datos decodificados ya vienen en req.usuario
  res.json({
    mensaje: 'Perfil de usuario obtenido con éxito',
    usuario: req.usuario
  });
});

export default router;