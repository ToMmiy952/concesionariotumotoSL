import app from './app.js';
import { env } from './config/env.js';

// Levanta el servidor HTTP escuchando en el puerto configurado
app.listen(env.PORT, () => {
  console.log(`🚀 Servidor backend escuchando en http://localhost:${env.PORT}`);
});