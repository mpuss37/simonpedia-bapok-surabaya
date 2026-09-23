import app from "../server/src/app"

// Vercel Serverless Function.
// Express app diimpor langsung (static) agar Vercel ikut men-trace dan
// membundel seluruh dependency-nya (server/src, @prisma/client, engine).
export default app
