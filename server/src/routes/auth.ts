import { Router } from "express"

const router = Router()

// Kredensial admin default (dapat diubah lewat env).
const ADMIN_USER = process.env.ADMIN_USER || "admin"
const ADMIN_PASS = process.env.ADMIN_PASS || "admin"

// Token sesi sederhana. Catatan: ini bukan JWT, hanya penanda untuk tahap ini.
const ADMIN_TOKEN = "simonpedia-admin-session"

router.post("/login", (req, res) => {
  const { username, password } = req.body ?? {}

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({
      ok: true,
      token: ADMIN_TOKEN,
      user: { username: ADMIN_USER, role: "admin" },
    })
  }

  return res.status(401).json({ ok: false, error: "Username atau password salah" })
})

router.get("/me", (req, res) => {
  const token = req.header("authorization")?.replace("Bearer ", "")
  if (token === ADMIN_TOKEN) {
    return res.json({ ok: true, user: { username: ADMIN_USER, role: "admin" } })
  }
  return res.status(401).json({ ok: false, error: "Belum masuk" })
})

export default router
