import app from "../server/src/app"

// Vercel Serverless Function.
// Express app dipanggil langsung sebagai request handler.
// Semua request ke /api/* diarahkan ke sini lewat vercel.json.
export default app
