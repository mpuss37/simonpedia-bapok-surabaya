import type { Request, Response, NextFunction } from "express"
import { verifikasiToken } from "../lib/auth"

/**
 * Middleware: hanya boleh diakses dengan token admin yang valid.
 * Token dikirim lewat header `Authorization: Bearer <token>`.
 */
export function wajibAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : undefined

  const payload = verifikasiToken(token)
  if (!payload || payload.role !== "admin") {
    return res.status(401).json({ error: "Akses ditolak. Silakan masuk sebagai admin." })
  }

  // Simpan info admin pada request untuk dipakai handler bila perlu.
  ;(req as Request & { admin?: { username: string } }).admin = {
    username: payload.sub,
  }

  next()
}
