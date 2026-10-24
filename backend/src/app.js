import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

// 1. Middleware de CORS (autoriza al puerto del frontend React)
app.use(cors({
  origin: env.CORS_ORIGIN
}));

// 2. Middleware para parsear el cuerpo de las peticiones en JSON
app.use(express.json());

app.use('/api/auth', authRoutes); // Prefijo para autenticación (/api/auth/login, /api/auth/registro, etc.)

// 3. Ruta base de prueba de estado de la API
app.get('/api/health', (req, res) => {
  res.json({ ok: true, mensaje: 'API tuMotoSL funcionando correctamente' });
});

// 4. Manejador para rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

export default app;