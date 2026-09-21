// Base URL API.
//
// Selalu pakai path relatif "/api" baik di dev maupun produksi:
// - Produksi (Vercel): /api ditangani serverless function (satu domain).
// - Development: Vite mem-proxy "/api" ke backend Express di localhost:3001
//   (lihat vite.config.ts). Jadi dari HP pun cukup akses IP laptop:5173.
//
// Kalau backend di-host terpisah, override lewat env VITE_API_URL,
// contoh: VITE_API_URL=https://backend-kamu.up.railway.app/api
export const API_URL = import.meta.env.VITE_API_URL ?? "/api"
