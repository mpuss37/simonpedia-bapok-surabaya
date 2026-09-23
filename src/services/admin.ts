import { API_URL } from "./api"

// =====================================================
// AUTH
// =====================================================

const TOKEN_KEY = "simonpedia-admin-token"

export function simpanToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function ambilToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY)
}

export function hapusToken() {
  window.localStorage.removeItem(TOKEN_KEY)
}

export function sudahMasuk(): boolean {
  return !!ambilToken()
}

export async function loginAdmin(username: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Gagal masuk")
  simpanToken(data.token)
  return data
}

// =====================================================
// HET
// =====================================================

export interface HetItem {
  id: number
  kode: string
  komoditas: string
  harga: number | null
  satuan: string
  sumber: string
  status: string
  catatan: string | null
  updatedAt: string
}

export async function getHet(): Promise<HetItem[]> {
  const res = await fetch(`${API_URL}/het`)
  if (!res.ok) throw new Error("Gagal mengambil data HET")
  return res.json()
}

export async function updateHet(
  id: number,
  data: { harga?: number | null; catatan?: string; status?: string },
): Promise<HetItem> {
  const res = await fetch(`${API_URL}/het/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Gagal memperbarui HET")
  return res.json()
}

// =====================================================
// RIWAYAT INPUT
// =====================================================

export interface RiwayatItem {
  id: number
  namaFile: string
  jenis: string
  jumlahBaris: number
  berhasil: number
  gagal: number
  status: "berhasil" | "sebagian" | "gagal"
  catatan: string | null
  createdAt: string
}

export async function getRiwayat(): Promise<RiwayatItem[]> {
  const res = await fetch(`${API_URL}/riwayat`)
  if (!res.ok) throw new Error("Gagal mengambil riwayat input")
  return res.json()
}

export async function hapusRiwayat(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/riwayat/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Gagal menghapus riwayat")
}

// =====================================================
// IMPORT DATA
// =====================================================

export interface BarisImport {
  tanggal?: string
  kategori?: string
  komoditas?: string
  satuan?: string
  pasar?: string
  harga?: number | string
}

export async function importBaris(
  namaFile: string,
  jenis: string,
  baris: BarisImport[],
) {
  const res = await fetch(`${API_URL}/admin/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ namaFile, jenis, baris }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Gagal mengimpor data")
  }
  return res.json()
}

// =====================================================
// RINGKASAN UNTUK DASHBOARD
// =====================================================

export async function getStatistikAdmin() {
  const [komoditas, pasar, ringkasan] = await Promise.all([
    fetch(`${API_URL}/komoditas`).then((r) => r.json()),
    fetch(`${API_URL}/pasar`).then((r) => r.json()),
    fetch(`${API_URL}/harga/ringkasan`).then((r) => r.json()),
  ])
  return {
    komoditas: Array.isArray(komoditas) ? komoditas.length : 0,
    pasar: Array.isArray(pasar) ? pasar.length : 0,
    harga: ringkasan?.total ?? 0,
  }
}
