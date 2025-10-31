import Redis from "ioredis";

let connection: Redis | null = null;
let connectionPromise: Promise<Redis> | null = null;

function getConnection(): Redis {
  // 构建阶段跳过 Redis 连接
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('Redis connection should not be initialized during build');
  }

  if (!connection) {
    // 根据环境选择 Redis 配置
    let redisUrl: string;
    let redisOptions: any = {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      enableOfflineQueue: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
      retryStrategy: (times) => {
        if (times > 3) {
          console.error(`❌ Redis 重试失败,已达最大次数: ${times}`);
          return null;
        }
        const delay = Math.min(times * 500, 2000);
        console.log(`🔄 Redis 重连中... (第 ${times} 次,延迟 ${delay}ms)`);
        return delay;
      },
    };

    // 检查是否使用 Upstash (REST API)
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      // Upstash 使用标准 Redis 协议,不是 REST API
      // 从 REST URL 提取主机名
      const upstashHost = process.env.UPSTASH_REDIS_REST_URL.replace('https://', '');
      redisUrl = `rediss://:${process.env.UPSTASH_REDIS_REST_TOKEN}@${upstashHost}:6379`;

      // Upstash 需要 TLS
      redisOptions.tls = {
        rejectUnauthorized: false, // Upstash 使用自签名证书
      };

      console.log(`🔌 使用 Upstash Redis: ${upstashHost}`);
    } else if (process.env.REDIS_URL) {
      redisUrl = process.env.REDIS_URL;
      console.log(`🔌 使用自定义 Redis: ${redisUrl.replace(/:[^:]+@/, ':***@')}`);
    } else {
      redisUrl = "redis://localhost:6379";
      console.log(`🔌 使用本地 Redis: ${redisUrl}`);
    }

    connection = new Redis(redisUrl, redisOptions);

    connection.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });

    connection.on("error", (err) => {
      console.error("❌ Redis connection error:", err.message);
    });

    connection.on("ready", () => {
      console.log("✅ Redis ready to accept commands");
    });
  }

  return connection;
}

// 新增:异步连接方法,用于 API 路由
export async function ensureConnection(): Promise<Redis> {
  if (!connectionPromise) {
    connectionPromise = (async () => {
      const conn = getConnection();
      if (conn.status === 'ready') {
        return conn;
      }
      try {
        await conn.connect();
        return conn;
      } catch (error) {
        console.error('❌ Redis 连接失败:', error);
        connectionPromise = null; // 重置以便下次重试
        throw error;
      }
    })();
  }
  return connectionPromise;
}

export { getConnection as connection };
