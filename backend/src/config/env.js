process.loadEnvFile(); // Carga automáticamente las variables del archivo .env

export const env = {
  PORT: process.env.PORT ?? 3000,
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  PGHOST: process.env.PGHOST ?? 'localhost',
  PGPORT: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  PGUSER: process.env.PGUSER ?? 'postgres',
  PGPASSWORD: process.env.PGPASSWORD ?? 'postgres',
  PGDATABASE: process.env.PGDATABASE ?? 'tumotosl',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '8h',
};


if (!env.JWT_SECRET) {
  throw new Error('Falta JWT_SECRET en el archivo .env');
}