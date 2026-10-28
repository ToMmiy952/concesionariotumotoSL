import pkg from 'pg';
import { env } from './env.js';

const { Pool } = pkg;

// Pool de conexiones
export const pool = new Pool({
  host: env.PGHOST,
  port: env.PGPORT,
  user: env.PGUSER,
  password: env.PGPASSWORD,
  database: env.PGDATABASE,

  max: 20, // cantidad máxima de clientes (conexiones) simultáneas en el pool
  min: 0, // cantidad mínima de clientes que se mantienen abiertos en el pool

  idleTimeoutMillis: 30000, // ms que una conexión inactiva puede quedar abierta antes de cerrarse
  connectionTimeoutMillis: 5000, // ms de espera para establecer una conexión antes de fallar
  query_timeout: 10000, // ms máximo de espera por la respuesta de una query (lado cliente)
  statement_timeout: 10000, // ms máximo que el servidor Postgres deja correr una sentencia SQL

  allowExitOnIdle: false, // si está en true, permite que el proceso de Node termine cuando el pool queda vacío e inactivo
});

// Log de errores de conexiones inactivas que el servidor puede cerrar inesperadamente
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de conexiones', err);
});

// Ejecuta `trabajo(client)` dentro de una transacción: COMMIT si termina bien, ROLLBACK si lanza un error
export async function conTransaccion(trabajo) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const resultado = await trabajo(client);
    await client.query('COMMIT');
    return resultado;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
