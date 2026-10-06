import type { APIRoute } from 'astro';
import type { RowDataPacket } from 'mysql2/promise';
import { pool } from '../../../lib/db';

// Endpoint dinámico (SSR): se ejecuta en el servidor en cada petición.
export const prerender = false;

const COLUMNAS = [
  'fac', 'facultad', 'carrera', 'lugar_1', 'registro', 'nombre',
  'centro_interno', 'icu_facultativo', 'ful', 'mesa', 'recinto', 'lugar_2', 'aula',
].join(', ');

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export const GET: APIRoute = async ({ params }) => {
  const registro = (params.registro ?? '').trim();
  if (!registro) return json({ error: 'registro requerido' }, 400);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT ${COLUMNAS} FROM registros_facultad WHERE registro = ? ORDER BY mesa`,
    [registro],
  );

  if (rows.length === 0) return json({ error: 'no encontrado' }, 404);
  return json(rows, 200);
};
