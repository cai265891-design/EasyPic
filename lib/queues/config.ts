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
      lazyConnect: true,
      enableOfflineQueue: true,
      connectTimeout: 30000,          // 增加连接超时到 30 秒 (Upstash 可能需要更长时间)
      commandTimeout: 15000,          // 增加命令超时到 15 秒
      keepAlive: 30000,               // 保持连接活跃 (30 秒发送一次 PING)
      enableReadyCheck: true,         // 启用就绪检查
      maxRetriesPerRequest: null,     // ⚠️ BullMQ 要求必须为 null (使用阻塞命令 BRPOP)
      reconnectOnError: (err) => {    // 遇到特定错误时重连
        const targetErrors = ['READONLY', 'ETIMEDOUT', 'ECONNRESET'];
        if (targetErrors.some(target => err.message.includes(target))) {
          console.log(`🔄 检测到可恢复错误,尝试重连: ${err.message}`);
          return true;
        }
        return false;
      },
      retryStrategy: (times) => {
        if (times > 5) {  // 增加重试次数到 5
          console.error(`❌ Redis 重试失败,已达最大次数: ${times}`);
          return null;
        }
        const delay = Math.min(times * 1000, 5000);  // 增加重试间隔 (1s, 2s, 3s, 4s, 5s)
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
        rejectUnauthorized: false,
      };

      console.log(`🔌 使用 Upstash Redis: ${upstashHost}`);
    } else if (process.env.REDIS_URL) {
      redisUrl = process.env.REDIS_URL;

      // 自动检测 Upstash 并强制启用 TLS
      const isUpstash = redisUrl.includes('upstash.io');
      if (isUpstash) {
        // 将 redis:// 替换为 rediss:// (强制 TLS)
        redisUrl = redisUrl.replace(/^redis:\/\//, 'rediss://');
        redisOptions.tls = {
          rejectUnauthorized: false,
        };
        console.log(`🔌 使用 Upstash Redis (TLS): ${redisUrl.replace(/:[^:]+@/, ':***@')}`);
      } else {
        console.log(`🔌 使用自定义 Redis: ${redisUrl.replace(/:[^:]+@/, ':***@')}`);
      }
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
