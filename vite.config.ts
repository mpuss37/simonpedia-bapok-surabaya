import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Expose ke jaringan lokal (LAN) supaya bisa diakses dari HP.
    host: true,
    port: 5173,
    // Teruskan request /api ke backend Express (port 3001).
    // Dengan ini HP cukup akses satu alamat (IP laptop:5173) saja.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})