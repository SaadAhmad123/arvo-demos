import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  publicDir: 'public',
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ['buffer'],
    }),
  ],
  server: {},
});
