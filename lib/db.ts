import { PrismaClient } from "@prisma/client"
import { sanitizeDatabaseUrl } from "./utils/database-url"
// import "server-only"; // Commented out for worker compatibility

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient
}

// 在初始化 Prisma Client 前验证并修复 DATABASE_URL
if (process.env.DATABASE_URL) {
  try {
    const originalUrl = process.env.DATABASE_URL;
    const sanitizedUrl = sanitizeDatabaseUrl(originalUrl);

    if (sanitizedUrl !== originalUrl) {
      process.env.DATABASE_URL = sanitizedUrl;
      console.log('✅ DATABASE_URL 已自动修复');
    }
  } catch (error: any) {
    console.error('❌ DATABASE_URL 验证失败:', error.message);
    // 不阻止启动,让 Prisma 自己报错 (提供更详细的错误信息)
  }
}

export let prisma: PrismaClient
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient()
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient()
  }
  prisma = global.cachedPrisma
}
