import type { Request } from "express"
import { prisma } from "./prisma"

interface AuditInput {
  /** Username admin pelaku. */
  admin: string
  /** Kode aksi singkat, mis. "ubah_het", "hapus_komoditas", "login". */
  aksi: string
  /** Nama entitas/model, mis. "Het", "Komoditas", "Auth". */
  entitas: string
  /** Id baris yang terpengaruh (bila ada). */
  entitasId?: number | null
  /** Ringkasan manusiawi dari aksi. */
  deskripsi: string
  /** Nilai sebelum perubahan (objek apa pun). */
  dataLama?: unknown
  /** Nilai sesudah perubahan (objek apa pun). */
  dataBaru?: unknown
  /** Alamat IP pelaku. */
  ip?: string | null
  /** Apakah aksi berhasil. */
  berhasil?: boolean
}

/** Ambil alamat IP dari request (menghormati proxy Vercel). */
export function ambilIp(req: Request): string | null {
  const fwd = req.header("x-forwarded-for")
  if (fwd) return fwd.split(",")[0].trim()
  return req.socket.remoteAddress ?? null
}

/** Ambil username admin dari request (di-set oleh middleware wajibAdmin). */
export function ambilAdmin(req: Request): string {
  const admin = (req as Request & { admin?: { username: string } }).admin
  return admin?.username ?? "sistem"
}

/**
 * Simpan satu entri audit. Tabel ini bersifat append-only — tidak ada
 * operasi ubah/hapus, agar jejak audit tetap utuh untuk pertanggungjawaban.
 */
export async function catatAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        admin: input.admin,
        aksi: input.aksi,
        entitas: input.entitas,
        entitasId: input.entitasId ?? null,
        deskripsi: input.deskripsi,
        dataLama: input.dataLama !== undefined ? JSON.stringify(input.dataLama) : null,
        dataBaru: input.dataBaru !== undefined ? JSON.stringify(input.dataBaru) : null,
        ip: input.ip ?? null,
        berhasil: input.berhasil ?? true,
      },
    })
  } catch (error) {
    // Kegagalan mencatat audit tidak boleh menggagalkan aksi utama,
    // tetapi tetap dilaporkan ke log server.
    console.error("Gagal mencatat audit:", error)
  }
}
