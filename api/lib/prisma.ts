import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Koneksi Prisma dengan retry untuk error koneksi transient.
 *
 * Neon (serverless Postgres) bisa "tidur" saat idle, sehingga request pertama
 * kadang gagal dengan P1001/P1017 ("Can't reach database server"). Ekstensi
 * ini otomatis mencoba ulang beberapa kali sebelum menyerah.
 */
function buatClient() {
  const base = new PrismaClient({ log: ["error"] })

  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        const MAKS = 5
        let terakhirError: unknown

        for (let i = 0; i < MAKS; i++) {
          try {
            return await query(args)
          } catch (err) {
            terakhirError = err
            const pesan = err instanceof Error ? err.message : String(err)
            const transient =
              pesan.includes("Can't reach database server") ||
              pesan.includes("P1001") ||
              pesan.includes("P1017") ||
              pesan.includes("Connection") ||
              pesan.includes("Server has closed the connection")

            if (!transient || i === MAKS - 1) throw err
            // Tunggu sebelum mencoba lagi (backoff naik).
            await new Promise((r) => setTimeout(r, 500 * (i + 1)))
          }
        }
        throw terakhirError
      },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? (buatClient() as unknown as PrismaClient)

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
