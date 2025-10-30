import { NextResponse } from "next/server";

/**
 * 调试接口 - 检查环境变量配置
 * GET /api/debug/env
 *
 * 注意: 生产环境请删除此文件!
 */
export async function GET() {
  try {
    const envCheck = {
      // 公开环境变量 (可以安全显示)
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "❌ 未配置",
      NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK || "未配置",

      // 敏感变量 (只显示是否存在)
      AUTH_SECRET: process.env.AUTH_SECRET ? "✅ 已配置" : "❌ 未配置",
      DATABASE_URL: process.env.DATABASE_URL ? "✅ 已配置" : "❌ 未配置",
      REDIS_URL: process.env.REDIS_URL ? "✅ 已配置" : "❌ 未配置",
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? "✅ 已配置" : "❌ 未配置",

      // Cloudflare R2
      CLOUDFLARE_R2_ACCESS_KEY: process.env.CLOUDFLARE_R2_ACCESS_KEY ? "✅ 已配置" : "❌ 未配置",
      CLOUDFLARE_R2_SECRET_KEY: process.env.CLOUDFLARE_R2_SECRET_KEY ? "✅ 已配置" : "❌ 未配置",
      CLOUDFLARE_R2_BUCKET: process.env.CLOUDFLARE_R2_BUCKET || "❌ 未配置",
      CLOUDFLARE_R2_ENDPOINT: process.env.CLOUDFLARE_R2_ENDPOINT || "❌ 未配置",
      CLOUDFLARE_R2_PUBLIC_URL: process.env.CLOUDFLARE_R2_PUBLIC_URL || "❌ 未配置",

      // Node 环境
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL ? "✅ Vercel 环境" : "❌ 本地环境",
      VERCEL_ENV: process.env.VERCEL_ENV || "未知",
    };

    // 测试 Redis 连接
    let redisStatus = "未测试";
    if (process.env.REDIS_URL) {
      try {
        const Redis = require("ioredis");
        const redis = new Redis(process.env.REDIS_URL, {
          connectTimeout: 5000,
          maxRetriesPerRequest: 1,
        });

        await redis.ping();
        redisStatus = "✅ 连接成功";
        redis.disconnect();
      } catch (error: any) {
        redisStatus = `❌ 连接失败: ${error.message}`;
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      redis: redisStatus,
      warning: "⚠️ 此接口包含敏感信息,生产环境请立即删除!",
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
