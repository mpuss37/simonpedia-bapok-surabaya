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

/** Cek apakah IP termasuk privat/lokal. */
function ipPrivat(ip: string): boolean {
  const b = ip.replace(/^::ffff:/, "")
  return (
    b === "::1" ||
    b === "127.0.0.1" ||
    b.startsWith("10.") ||
    b.startsWith("192.168.") ||
    /^172\.(1[6-9]|2[0-9]|3[01])\./.test(b) ||
    b.startsWith("169.254.")
  )
}

/**
 * Deteksi penyedia internet (ISP) dari IP publik.
 *
 * Untuk IP publik, dipakai lookup geolokasi gratis (ipapi.co) dengan timeout
 * singkat. Bila gagal (offline/timeout), dikembalikan penanda umum agar
 * pencatatan audit tetap berjalan.
 */
export async function tebakIsp(ip: string | null): Promise<string> {
  if (!ip) return "Tidak diketahui"
  const bersih = ip.replace(/^::ffff:/, "")

  if (ipPrivat(bersih)) return "Jaringan Lokal"

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(bersih)}?fields=status,isp,org,as,country`,
      { signal: controller.signal },
    )
    clearTimeout(timeout)
    if (!res.ok) return "Tidak dapat dideteksi"
    const data = (await res.json()) as {
      status?: string
      isp?: string
      org?: string
      as?: string
      country?: string
    }
    if (data.status && data.status !== "success") return "Tidak dapat dideteksi"
    const nama = data.isp || data.org || data.as || ""
    if (nama) return data.country ? `${nama} (${data.country})` : nama
    return "Tidak dapat dideteksi"
  } catch {
    return "Tidak dapat dideteksi (lookup gagal)"
  }
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
        isp: await tebakIsp(input.ip ?? null),
        berhasil: input.berhasil ?? true,
      },
    })
  } catch (error) {
    // Kegagalan mencatat audit tidak boleh menggagalkan aksi utama,
    // tetapi tetap dilaporkan ke log server.
    console.error("Gagal mencatat audit:", error)
  }
}
