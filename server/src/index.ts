import express from "express"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

import komoditasRoutes from "./routes/komoditas"
import pasarRoutes from "./routes/pasar"
import hargaRoutes from "./routes/harga"
import ewsRoutes from "./routes/ews"
import predictionRoutes from "./routes/prediction"

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
app.use("/api/ews", ewsRoutes)
app.use("/api/prediction", predictionRoutes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
