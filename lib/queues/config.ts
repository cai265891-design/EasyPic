import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

connection.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

connection.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

export { connection };
