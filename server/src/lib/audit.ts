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
  /** Request asli (untuk ekstrak info perangkat). */
  req?: Request
}

// =====================================================
// INFO PERANGKAT & JARINGAN
// =====================================================

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

/** Tebak sistem operasi dari user agent. */
export function tebakOS(ua: string): string {
  if (/windows nt 10/i.test(ua)) return "Windows 10/11"
  if (/windows nt 6\.3/i.test(ua)) return "Windows 8.1"
  if (/windows/i.test(ua)) return "Windows"
  if (/android/i.test(ua)) return "Android"
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS"
  if (/mac os x/i.test(ua)) return "macOS"
  if (/linux/i.test(ua)) return "Linux"
  return "Tidak diketahui"
}

/** Tebak browser dari user agent. */
export function tebakBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return "Microsoft Edge"
  if (/opr\//i.test(ua) || /opera/i.test(ua)) return "Opera"
  if (/chrome|crios/i.test(ua)) return "Chrome"
  if (/firefox|fxios/i.test(ua)) return "Firefox"
  if (/safari/i.test(ua)) return "Safari"
  return "Tidak diketahui"
}

/**
 * Tebak penyedia internet (ISP) dari alamat IP publik.
 *
 * CATATAN: ini perkiraan kasar berbasis blok IP. Tidak ada lookup DNS
 * online agar tetap cepat & tanpa dependensi eksternal. Untuk akurasi
 * tinggi, gunakan layanan geolokasi IP (butuh jaringan internet).
 * IP privat / lokal ditandai khusus.
 */
export function tebakIsp(ip: string | null): string {
  if (!ip) return "Tidak diketahui"
  const bersih = ip.replace(/^::ffff:/, "")

  if (
    bersih === "::1" ||
    bersih === "127.0.0.1" ||
    bersih.startsWith("10.") ||
    bersih.startsWith("192.168.") ||
    bersih.startsWith("172.16.") ||
    bersih.startsWith("172.17.") ||
    bersih.startsWith("172.18.") ||
    bersih.startsWith("172.19.") ||
    /^172\.(2[0-9]|3[01])\./.test(bersih) ||
    bersih.startsWith("169.254.")
  ) {
    return "Jaringan Lokal"
  }
  // Vercel serverless umumnya berada di AWS.
  return "Tidak dapat dideteksi otomatis (perlu lookup IP)"
}

/**
 * Simpan satu entri audit. Tabel ini bersifat append-only — tidak ada
 * operasi ubah/hapus, agar jejak audit tetap utuh untuk pertanggungjawaban.
 */
export async function catatAudit(input: AuditInput): Promise<void> {
  try {
    const ua = input.req?.header("user-agent") ?? ""
    const hostHeader = input.req?.header("host") ?? null

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
        userAgent: ua || null,
        os: ua ? tebakOS(ua) : null,
        browser: ua ? tebakBrowser(ua) : null,
        hostname: hostHeader,
        isp: tebakIsp(input.ip ?? null),
        berhasil: input.berhasil ?? true,
      },
    })
  } catch (error) {
    // Kegagalan mencatat audit tidak boleh menggagalkan aksi utama,
    // tetapi tetap dilaporkan ke log server.
    console.error("Gagal mencatat audit:", error)
  }
}
