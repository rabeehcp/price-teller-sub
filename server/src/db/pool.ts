import { Pool, PoolConfig, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let postgresConnected = false;

function getPoolConfig(): PoolConfig {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const isSsl =
      process.env.PGSSL === 'true' ||
      databaseUrl.includes('sslmode=require') ||
      databaseUrl.includes('supabase') ||
      databaseUrl.includes('neon.tech') ||
      databaseUrl.includes('aivencloud.com');

    // Remove ?sslmode=... so pg does not override rejectUnauthorized: false
    const cleanUrl = isSsl ? databaseUrl.replace(/[\?&]sslmode=[^&]+/, '') : databaseUrl;

    return {
      connectionString: cleanUrl,
      connectionTimeoutMillis: 8000,
      ssl: isSsl ? { rejectUnauthorized: false } : undefined,
    };
  }

  return {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'priceteller',
    connectionTimeoutMillis: 3000,
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
  };
}

export const pool = new Pool(getPoolConfig());

pool.on('error', (err) => {
  if (postgresConnected) {
    console.error('Unexpected error on idle PostgreSQL client', err.message);
  }
});

export function setPostgresConnected(status: boolean) {
  postgresConnected = status;
}

export function isPostgresConnected(): boolean {
  return postgresConnected;
}

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (process.env.DEBUG_SQL === 'true') {
    console.log('[PostgreSQL]', { text, duration: `${duration}ms`, rows: res.rowCount });
  }
  return res;
}
