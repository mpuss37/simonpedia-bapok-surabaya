// Vercel Serverless Function.
// Semua request ke /api/* diarahkan ke sini lewat vercel.json.
//
// App Express dimuat SECARA DINAMIS di dalam handler supaya bila terjadi
// error saat memuat modul (mis. Prisma/engine/env), penyebabnya dapat
// ditangkap dan dikembalikan sebagai JSON — bukan sekadar 500 tanpa keterangan.

type HandlerFn = (req: unknown, res: unknown) => unknown

let appPromise: Promise<HandlerFn> | null = null

async function muatApp(): Promise<HandlerFn> {
  if (!appPromise) {
    appPromise = import("../server/src/app").then(
      (mod) => (mod.default ?? mod) as unknown as HandlerFn,
    )
  }
  return appPromise
}

export default async function handler(req: unknown, res: unknown) {
  const r = res as {
    status?: (n: number) => { json: (o: unknown) => void }
  }
  try {
    const app = await muatApp()
    return app(req, res)
  } catch (error) {
    // Reset agar percobaan berikutnya memuat ulang.
    appPromise = null
    const pesan = error instanceof Error ? error.message : String(error)
    const tumpukan = error instanceof Error ? error.stack : undefined
    const info = {
      error: "Gagal memuat fungsi",
      pesan,
      tumpukan,
      env: {
        adaDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        platform: process.platform,
      },
    }
    if (r.status) {
      r.status(500).json(info)
    } else {
      console.error(info)
      throw error
    }
  }
}
