const API_URL = "http://localhost:3001/api"

export interface Komoditas {
  id: number
  nama: string
  kategori: string
  satuan: string
}

export interface Pasar {
  id: number
  nama: string
  kecamatan: string
  kelas: string
  lat: number | null
  lng: number | null
  wilayahId: number
  wilayah: {
    id: number
    nama: string
    kode: string
  }
}

export interface Harga {
  id: number
  harga: number
  tanggal: string
  sumber: string | null
  komoditas: Komoditas
  pasar: {
    id: number
    nama: string
    kecamatan: string
  }
}

export async function getKomoditas(): Promise<Komoditas[]> {
  const res = await fetch(`${API_URL}/komoditas`)
  if (!res.ok) throw new Error("Gagal mengambil data komoditas")
  return res.json()
}

export async function getPasar(): Promise<Pasar[]> {
  const res = await fetch(`${API_URL}/pasar`)
  if (!res.ok) throw new Error("Gagal mengambil data pasar")
  return res.json()
}

export async function getHarga(filters?: {
  pasarId?: number
  komoditasId?: number
}): Promise<Harga[]> {
  const params = new URLSearchParams()
  if (filters?.pasarId) params.append("pasar_id", String(filters.pasarId))
  if (filters?.komoditasId)
    params.append("komoditas_id", String(filters.komoditasId))

  const url = params.toString()
    ? `${API_URL}/harga?${params}`
    : `${API_URL}/harga`

  const res = await fetch(url)
  if (!res.ok) throw new Error("Gagal mengambil data harga")
  return res.json()
}
