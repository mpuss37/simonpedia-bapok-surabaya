import dotenv from "dotenv"

dotenv.config()

import app from "../../api/app"

const PORT = process.env.PORT || 3001

// Bind ke 0.0.0.0 supaya bisa diakses dari HP pada jaringan yang sama.
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
