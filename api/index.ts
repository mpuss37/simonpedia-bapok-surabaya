import app from "../server/src/app.js"

// Vercel Serverless Function (satu-satunya di folder api/).
// Express app berada di server/src agar Vercel tidak menganggap setiap
// file server sebagai Serverless Function terpisah.
export default app
