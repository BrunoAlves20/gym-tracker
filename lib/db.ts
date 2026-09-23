// lib/db.ts
import { Pool } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('A variável DATABASE_URL não está configurada no .env.local');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Query executada:', { text, duration: `${duration}ms`, rows: res.rowCount });
  }
  
  return res;
}

export default pool;