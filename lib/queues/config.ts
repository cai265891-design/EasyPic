import Redis from "ioredis";

let connection: Redis | null = null;

function getConnection(): Redis {
  // 构建阶段跳过 Redis 连接
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('Redis connection should not be initialized during build');
  }

  if (!connection) {
    connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: null,
      lazyConnect: false, // 改为 false,立即连接避免 lazy connect 超时
      enableOfflineQueue: true, // 启用离线队列,允许在连接建立前缓冲命令
      connectTimeout: 10000, // 10秒连接超时
      commandTimeout: 5000, // 5秒命令超时
      retryStrategy: (times) => {
        // 在 Vercel 环境最多重试 3 次,每次间隔 1 秒
        if (times > 3) {
          console.error(`❌ Redis 重试失败,已达最大次数: ${times}`);
          return null; // 停止重试
        }
        const delay = Math.min(times * 1000, 3000);
        console.log(`🔄 Redis 重连中... (第 ${times} 次,延迟 ${delay}ms)`);
        return delay;
      },
    });

    connection.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });

    connection.on("error", (err) => {
      // 运行时环境打印详细错误
      if (process.env.VERCEL_ENV || process.env.NODE_ENV === 'development') {
        console.error("❌ Redis connection error:", err.message);
      }
    });

    connection.on("ready", () => {
      console.log("✅ Redis ready to accept commands");
    });
  }

  return connection;
}

export { getConnection as connection };
