-- Esquema de registros_facultad (MySQL 8+ / MariaDB 10.5+).
-- Aplicar una sola vez (es seguro volver a ejecutarlo, no borra datos):
--   mysql -u usuario -p voto_clave < sql/schema.sql

CREATE TABLE IF NOT EXISTS registros_facultad (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    fac             VARCHAR(100)  NULL,
    facultad        VARCHAR(255)  NULL,
    carrera         VARCHAR(255)  NULL,
    lugar_1         VARCHAR(255)  NULL,
    registro        VARCHAR(100)  NULL,
    nombre          VARCHAR(255)  NULL,
    centro_interno  VARCHAR(255)  NULL,
    icu_facultativo VARCHAR(100)  NULL,
    ful             VARCHAR(100)  NULL,
    mesa            VARCHAR(100)  NULL,
    recinto         VARCHAR(255)  NULL,
    lugar_2         VARCHAR(255)  NULL,
    aula            VARCHAR(100)  NULL,
    -- Un mismo registro tiene varias filas (una por mesa): el índice es obligatorio para la consulta.
    INDEX idx_registros_registro (registro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
