import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  define: {
    // Hier war der Fehler: Das Komma nach sourcemap oder die Struktur im define
    'process.env': 'import.meta.env'
  }
});
