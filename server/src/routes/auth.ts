import { Router } from "express"
import { buatToken, cekKredensial, verifikasiToken, ADMIN_USERNAME } from "../lib/auth"
import { catatAudit, ambilIp } from "../lib/audit"

const router = Router()

router.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {}
  const ip = ambilIp(req)

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Username dan password wajib diisi" })
  }

  if (cekKredensial(username, password)) {
    const token = buatToken(username, "admin")
    await catatAudit({
      admin: username,
      aksi: "login",
      entitas: "Auth",
      deskripsi: `Login admin berhasil`,
      ip,
      berhasil: true,
    })
    return res.json({
      ok: true,
      token,
      user: { username: ADMIN_USERNAME, role: "admin" },
    })
  }

  await catatAudit({
    admin: username || "(kosong)",
    aksi: "login_gagal",
    entitas: "Auth",
    deskripsi: `Percobaan login gagal untuk username "${username}"`,
    ip,
    berhasil: false,
  })

  return res.status(401).json({ ok: false, error: "Username atau password salah" })
})

router.get("/me", (req, res) => {
  const header = req.header("authorization") ?? ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : undefined
  const payload = verifikasiToken(token)

  if (payload && payload.role === "admin") {
    return res.json({ ok: true, user: { username: payload.sub, role: "admin" } })
  }
  return res.status(401).json({ ok: false, error: "Belum masuk" })
})

export default router
