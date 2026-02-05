
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Menggunakan stringify untuk memastikan nilai string terbungkus tanda kutip saat di-inject
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
