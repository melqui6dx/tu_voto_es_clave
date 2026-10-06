// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// Modo servidor: la API /api/consulta/[registro] consulta la base en cada petición.
// La página principal sigue siendo estática (ver prerender en index.astro).
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  vite: {
    plugins: [tailwindcss()],
  },
});
