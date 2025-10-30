import Redis from "ioredis";

let connection: Redis | null = null;

function getConnection(): Redis {
  if (!connection) {
    connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: null,
      lazyConnect: true, // 延迟连接
    });

    connection.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });

    connection.on("error", (err) => {
      console.error("❌ Redis connection error:", err);
    });

    // 仅在运行时连接
    if (process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV) {
      connection.connect().catch((err) => {
        console.error("❌ Redis initial connection failed:", err);
      });
    }
  }

  return connection;
}

export { getConnection as connection };
