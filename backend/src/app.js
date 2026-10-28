import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import motosRoutes from './routes/motos.routes.js';
import accesoriosRoutes from './routes/accesorios.routes.js';
import carritoRoutes from './routes/carrito.routes.js';
import reservasRoutes from './routes/reservas.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import ventasRoutes from './routes/ventas.routes.js';
import metricasRoutes from './routes/metricas.routes.js';
import { manejarErrores } from './middlewares/manejarErrores.js';

const app = express();

// 1. Middleware de CORS (autoriza al puerto del frontend React)
app.use(cors({
  origin: env.CORS_ORIGIN
}));

// 2. Middleware para parsear el cuerpo de las peticiones en JSON
app.use(express.json());

app.use('/api/v1/auth', authRoutes); // Prefijo para autenticación (/api/auth/login, /api/auth/registro, etc.)
app.use('/api/v1/motos', motosRoutes); // Prefijo para rutas de motos (/api/motos, /api/motos/:id, etc.)
app.use('/api/v1/accesorios', accesoriosRoutes); // Prefijo para rutas de accesorios (/api/accesorios, /api/accesorios/:id, etc.)
app.use('/api/v1/carrito', carritoRoutes); // Prefijo para rutas de carrito (/api/carrito, /api/carrito/items, etc.)
app.use('/api/v1/reservas', reservasRoutes); // Prefijo para rutas de reservas (/api/reservas, /api/reservas/:id, etc.)
app.use('/api/v1/usuarios', usuariosRoutes); // Gestión de usuarios (admin)
app.use('/api/v1/ventas', ventasRoutes); // Ventas online y presenciales
app.use('/api/v1/metricas', metricasRoutes); // Reportes de vendedor y admin
// 3. Ruta base de prueba de estado de la API
app.get('/api/health', (req, res) => {
  res.json({ ok: true, mensaje: 'API tuMotoSL funcionando correctamente' });
});

// 4. Manejador para rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// 5. Manejador centralizado de errores (siempre al final)
app.use(manejarErrores);

export default app;