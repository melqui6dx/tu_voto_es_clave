import mysql from 'mysql2/promise';
import { dbConfig } from './db-config.mjs';

// Pool compartido por las peticiones SSR. DATABASE_URL vive en .env (solo servidor).
export const pool = mysql.createPool({
  ...dbConfig(import.meta.env.DATABASE_URL),
  connectionLimit: 10,
  connectTimeout: 5000,
});
