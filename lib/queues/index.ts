import { Queue } from "bullmq";
import { connection } from "./config";

// 默认任务选项
const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential" as const,
    delay: 2000,
  },
  removeOnComplete: {
    count: 100, // 保留最近 100 个已完成的任务
  },
  removeOnFail: {
    count: 500, // 保留最近 500 个失败的任务
  },
};

// 图片识别队列
export const imageRecognitionQueue = new Queue("image-recognition", {
  connection,
  defaultJobOptions: {
    ...defaultJobOptions,
    timeout: 60000, // 60 秒超时
  },
});

// 文案生成队列
export const listingGenerationQueue = new Queue("listing-generation", {
  connection,
  defaultJobOptions: {
    ...defaultJobOptions,
    timeout: 90000, // 90 秒超时
  },
});

// 图片批量生成队列
export const imageGenerationQueue = new Queue("image-generation", {
  connection,
  defaultJobOptions: {
    ...defaultJobOptions,
    timeout: 600000, // 10 分钟超时（批量生成 5 张图）
    attempts: 2, // 图片生成只重试 2 次
  },
});

// 单张图片生成队列
export const imageSingleGenerationQueue = new Queue(
  "image-single-generation",
  {
    connection,
    defaultJobOptions: {
      ...defaultJobOptions,
      timeout: 120000, // 2 分钟超时
      attempts: 2,
    },
  }
);

// 导出所有队列（方便监控）
export const allQueues = [
  imageRecognitionQueue,
  listingGenerationQueue,
  imageGenerationQueue,
  imageSingleGenerationQueue,
];
