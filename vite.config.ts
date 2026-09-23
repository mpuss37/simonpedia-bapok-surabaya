import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    // Expose ke jaringan lokal (LAN) dan ngrok
    host: true,
    port: 5173,

    // Izinkan domain ngrok (wildcard agar tidak perlu ganti tiap restart ngrok)
    allowedHosts: ['.ngrok-free.app'],

    // Teruskan request /api ke backend Express
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})