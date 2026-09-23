import app from "./app"

// Vercel Serverless Function.
// Express app berada di folder api/ agar ikut dibundel oleh Vercel.
// Semua request ke /api/* diarahkan ke sini lewat vercel.json.
export default app
