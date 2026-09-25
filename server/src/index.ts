import dotenv from "dotenv"
import path from "node:path"

// Muat .env dari beberapa lokasi: root project dan folder server/.
// (Dev dijalankan dari root, sedangkan file .env ada di server/.)
dotenv.config({ path: path.resolve(process.cwd(), "server/.env") })
dotenv.config()

import app from "./app"

const PORT = process.env.PORT || 3001

// Bind ke 0.0.0.0 supaya bisa diakses dari HP pada jaringan yang sama.
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
