-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "browser" TEXT,
ADD COLUMN     "hostname" TEXT,
ADD COLUMN     "isp" TEXT,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "userAgent" TEXT;
