import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { fileURLToPath } from 'node:url';
import preset from './tailwind.preset.js';

/**
 * Shared Vite config for both frontends.
 * @param appDir absolute path of the app folder (pass import.meta.dirname-equivalent)
 * @param port   dev + preview port (strict: fails instead of silently picking another)
 */
export function createViteConfig(appDir: string, port: number) {
  return defineConfig({
    root: appDir,
    plugins: [react()],
    resolve: {
      alias: { '@': `${appDir}/src` },
    },
    css: {
      postcss: {
        plugins: [
          tailwindcss({
            presets: [preset],
            content: [`${appDir}/index.html`, `${appDir}/src/**/*.{js,ts,jsx,tsx}`],
          }),
          autoprefixer(),
        ],
      },
    },
    optimizeDeps: { exclude: ['lucide-react'] },
    server: { port, strictPort: true },
    preview: { port, strictPort: true },
    build: { outDir: `${appDir}/dist`, emptyOutDir: true },
  });
}

export const dirOf = (metaUrl: string) => fileURLToPath(new URL('.', metaUrl)).replace(/\/$/, '');
