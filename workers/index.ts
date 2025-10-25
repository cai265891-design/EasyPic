/**
 * Worker 进程主入口
 * 启动所有队列的 Worker
 */

import "./image-recognition.worker";
import "./listing-generation.worker";
import "./image-generation.worker";

console.log("🚀 所有 Worker 已启动，等待任务...");

// 优雅关闭
process.on("SIGTERM", async () => {
  console.log("收到 SIGTERM 信号，正在关闭 Workers...");
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("收到 SIGINT 信号，正在关闭 Workers...");
  process.exit(0);
});
