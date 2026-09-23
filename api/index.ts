// Vercel Serverless Function.
// App Express dimuat dinamis di dalam handler agar error pemuatan modul
// (mis. Prisma) dapat ditangkap dan dikembalikan sebagai JSON.
type HandlerFn = (req: unknown, res: unknown) => unknown

let modPromise: Promise<HandlerFn> | null = null

function muat(): Promise<HandlerFn> {
  if (!modPromise) {
    modPromise = import("./app").then(
      (mod) => ((mod as { default?: unknown }).default ?? mod) as unknown as HandlerFn,
    )
  }
  return modPromise
}

export default async function handler(req: unknown, res: unknown) {
  const r = res as { status?: (n: number) => { json: (o: unknown) => void } }
  try {
    const app = await muat()
    return app(req, res)
  } catch (error) {
    modPromise = null
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
    if (r.status) r.status(500).json(info)
    else throw error
  }
}
