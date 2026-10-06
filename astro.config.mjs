// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// Modo servidor en Vercel: la API /api/consulta/[registro] corre como función serverless.
// La página principal sigue siendo estática (ver prerender en index.astro) y se sirve desde el CDN.
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
});
