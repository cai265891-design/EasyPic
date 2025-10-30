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
      lazyConnect: true,
      enableOfflineQueue: false, // 禁用离线队列,构建时快速失败
    });

    connection.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });

    connection.on("error", (err) => {
      // 仅在运行时环境打印详细错误
      if (process.env.VERCEL_ENV || process.env.NODE_ENV === 'development') {
        console.error("❌ Redis connection error:", err.message);
      }
    });

    // 运行时才主动连接
    if (typeof window === 'undefined' && process.env.VERCEL_ENV !== 'production') {
      connection.connect().catch(() => {
        // 静默失败,运行时再处理
      });
    }
  }

  return connection;
}

export { getConnection as connection };
