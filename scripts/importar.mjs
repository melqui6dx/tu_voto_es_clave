// Carga un CSV en registros_facultad (MySQL).
// Acepta separador ',' o ';', con o sin cabecera, y BOM/CRLF.
// Si no hay cabecera, las 13 columnas se leen en el orden de la tabla.
//
// Uso:
//   npm run db:import -- datos/registros.csv              # carga (agrega)
//   npm run db:import -- datos/registros.csv --reemplazar # vacía y carga
//   npm run db:import -- datos/registros.csv --dry-run    # solo valida, no escribe

import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import mysql from 'mysql2/promise';
import { dbConfig } from '../src/lib/db-config.mjs';

const COLUMNAS = [
  'fac', 'facultad', 'carrera', 'lugar_1', 'registro', 'nombre',
  'centro_interno', 'icu_facultativo', 'ful', 'mesa', 'recinto', 'lugar_2', 'aula',
];
const FILAS_POR_INSERT = 500;

const args = process.argv.slice(2);
const archivo = args.find((a) => !a.startsWith('--'));
const reemplazar = args.includes('--reemplazar');
const dryRun = args.includes('--dry-run');

if (!archivo) {
  console.error('Uso: npm run db:import -- <archivo.csv> [--reemplazar] [--dry-run]');
  process.exit(1);
}
if (!dryRun && !process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL en .env');
  process.exit(1);
}

// 1) Leer y detectar separador y cabecera.
const texto = readFileSync(archivo, 'utf8').replace(/^﻿/, '');
const primeraLinea = texto.split(/\r?\n/, 1)[0];
const delimiter = (primeraLinea.match(/;/g)?.length ?? 0) > (primeraLinea.match(/,/g)?.length ?? 0) ? ';' : ',';
const tieneCabecera = primeraLinea.toLowerCase().includes('registro');

// 2) Parsear. Sin cabecera, se asignan las columnas por posición.
let filas;
try {
  filas = parse(texto, {
    delimiter,
    columns: tieneCabecera ? true : COLUMNAS,
    skip_empty_lines: true,
    trim: true,
  });
} catch (err) {
  console.error(`Error leyendo el CSV (separador "${delimiter}"): ${err.message}`);
  process.exit(1);
}

// 3) Validar que las columnas existan.
const faltantes = COLUMNAS.filter((c) => !(c in (filas[0] ?? {})));
if (faltantes.length) {
  console.error(`Faltan columnas: ${faltantes.join(', ')}`);
  process.exit(1);
}

console.log(`Archivo: ${archivo}`);
console.log(`Separador: "${delimiter}" | Cabecera: ${tieneCabecera ? 'sí' : 'no (orden fijo de 13 columnas)'}`);
console.log(`Filas válidas: ${filas.length}`);
console.log('Ejemplo de la primera fila:', filas[0]);

if (dryRun) {
  console.log('--dry-run: no se escribió nada.');
  process.exit(0);
}

// 4) Insertar en lotes dentro de una transacción.
const conn = await mysql.createConnection(dbConfig());

try {
  await conn.beginTransaction();
  if (reemplazar) await conn.query('TRUNCATE TABLE registros_facultad');

  for (let i = 0; i < filas.length; i += FILAS_POR_INSERT) {
    const lote = filas.slice(i, i + FILAS_POR_INSERT).map((fila) =>
      COLUMNAS.map((col) => (fila[col] === '' || fila[col] === undefined ? null : fila[col])),
    );
    // mysql2 expande "VALUES ?" con un array de filas.
    await conn.query(`INSERT INTO registros_facultad (${COLUMNAS.join(', ')}) VALUES ?`, [lote]);
    console.log(`Insertadas ${Math.min(i + FILAS_POR_INSERT, filas.length)} / ${filas.length}`);
  }

  await conn.commit();
  console.log('Importación completa.');
} catch (err) {
  await conn.rollback();
  console.error('Error, se revirtieron todos los cambios:', err.message);
  process.exitCode = 1;
} finally {
  await conn.end();
}
