import express from "express"
import cors from "cors"

import komoditasRoutes from "./routes/komoditas"
import pasarRoutes from "./routes/pasar"
import hargaRoutes from "./routes/harga"
import ewsRoutes from "./routes/ews"
import predictionRoutes from "./routes/prediction"
import authRoutes from "./routes/auth"
import hetRoutes from "./routes/het"
import riwayatRoutes from "./routes/riwayat"
import adminRoutes from "./routes/admin"

const app = express()

app.use(cors())
app.use(express.json({ limit: "25mb" }))

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "SIMONPEDIA API is running" })
})

app.use("/api/komoditas", komoditasRoutes)
app.use("/api/pasar", pasarRoutes)
app.use("/api/harga", hargaRoutes)
app.use("/api/ews", ewsRoutes)
app.use("/api/prediction", predictionRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/het", hetRoutes)
app.use("/api/riwayat", riwayatRoutes)
app.use("/api/admin", adminRoutes)

export default app
