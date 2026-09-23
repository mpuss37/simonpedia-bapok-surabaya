import crypto from "node:crypto"

/**
 * Modul autentikasi admin.
 *
 * - Password disimpan sebagai HASH (scrypt + salt acak), bukan plaintext.
 * - Token sesi ditandatangani dengan HMAC-SHA256 memakai ADMIN_SECRET,
 *   sehingga tidak bisa diubah/dipalsukan dari sisi klien.
 * - Verifikasi memakai perbandingan waktu-konstan (timingSafeEqual).
 */

const ADMIN_SECRET =
  process.env.ADMIN_SECRET || "simonpedia-bapok-surabaya-secret-2026"

const ADMIN_USER = process.env.ADMIN_USER || "admin"

// Password default: "admin". Disimpan sebagai hash scrypt.
// Format: scrypt$<salt-hex>$<hash-hex>
const DEFAULT_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH || hashPassword(process.env.ADMIN_PASS || "admin")

const TOKEN_TTL_MS = 1000 * 60 * 60 * 8 // 8 jam

// =====================================================
// PASSWORD HASHING (scrypt)
// =====================================================

export function hashPassword(password: string, salt?: string): string {
  const useSalt = salt ?? crypto.randomBytes(16).toString("hex")
  const hash = crypto.scryptSync(password, useSalt, 64).toString("hex")
  return `scrypt$${useSalt}$${hash}`
}

export function verifikasiPassword(password: string, tersimpan: string): boolean {
  const bagian = tersimpan.split("$")
  if (bagian.length !== 3 || bagian[0] !== "scrypt") return false

  const [, salt, hashTersimpan] = bagian
  const hashInput = crypto.scryptSync(password, salt, 64)

  const bufTersimpan = Buffer.from(hashTersimpan, "hex")
  if (bufTersimpan.length !== hashInput.length) return false

  return crypto.timingSafeEqual(bufTersimpan, hashInput)
}

// =====================================================
// TOKEN (HMAC-SHA256, menyerupai JWT sederhana)
// =====================================================

interface TokenPayload {
  sub: string
  role: string
  exp: number
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

function sign(data: string): string {
  return base64url(crypto.createHmac("sha256", ADMIN_SECRET).update(data).digest())
}

export function buatToken(username: string, role = "admin"): string {
  const payload: TokenPayload = {
    sub: username,
    role,
    exp: Date.now() + TOKEN_TTL_MS,
  }
  const body = base64url(JSON.stringify(payload))
  const sig = sign(body)
  return `${body}.${sig}`
}

export function verifikasiToken(token: string | undefined): TokenPayload | null {
  if (!token) return null

  const bagian = token.split(".")
  if (bagian.length !== 2) return null

  const [body, sig] = bagian

  // Periksa tanda tangan terlebih dahulu (waktu-konstan).
  const sigBenar = sign(body)
  const bufSig = Buffer.from(sig)
  const bufBenar = Buffer.from(sigBenar)
  if (bufSig.length !== bufBenar.length) return null
  if (!crypto.timingSafeEqual(bufSig, bufBenar)) return null

  // Ambil payload.
  try {
    const json = Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
    const payload = JSON.parse(json) as TokenPayload
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

// =====================================================
// KREDENSIAL
// =====================================================

export function cekKredensial(username: string, password: string): boolean {
  if (username !== ADMIN_USER) return false
  return verifikasiPassword(password, DEFAULT_PASSWORD_HASH)
}

export const ADMIN_USERNAME = ADMIN_USER
