// Convierte DATABASE_URL en opciones de conexión para mysql2.
// TiDB Cloud (y la mayoría de hostings de MySQL remotos) exigen TLS; por defecto se activa.
// Para MySQL local sin SSL: DATABASE_SSL=false

export function dbConfig(url = process.env.DATABASE_URL) {
  if (!url) throw new Error('Falta DATABASE_URL');
  const u = new URL(url);
  const usarSsl = process.env.DATABASE_SSL !== 'false';

  return {
    host: u.hostname,
    port: Number(u.port) || 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: decodeURIComponent(u.pathname.replace(/^\//, '')),
    ssl: usarSsl ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
  };
}
