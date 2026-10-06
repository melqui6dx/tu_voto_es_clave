import mysql from 'mysql2/promise';
import { dbConfig } from './db-config.mjs';

// Pool por instancia serverless (Vercel levanta varias en picos): pocas conexiones por instancia.
// DATABASE_URL vive en .env localmente y en las variables de entorno del proyecto en Vercel.
export const pool = mysql.createPool({
  ...dbConfig(import.meta.env.DATABASE_URL ?? process.env.DATABASE_URL),
  connectionLimit: 3,
  connectTimeout: 5000,
});
