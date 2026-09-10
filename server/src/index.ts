import express from "express"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

import komoditasRoutes from "./routes/komoditas"
import pasarRoutes from "./routes/pasar"
import hargaRoutes from "./routes/harga"

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "SIMONPEDIA API is running" })
})

app.use("/api/komoditas", komoditasRoutes)
app.use("/api/pasar", pasarRoutes)
app.use("/api/harga", hargaRoutes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
