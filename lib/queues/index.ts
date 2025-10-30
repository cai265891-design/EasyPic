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

let _imageRecognitionQueue: Queue | null = null;
let _listingGenerationQueue: Queue | null = null;
let _imageGenerationQueue: Queue | null = null;
let _imageSingleGenerationQueue: Queue | null = null;

// 图片识别队列
export function getImageRecognitionQueue(): Queue {
  if (!_imageRecognitionQueue) {
    _imageRecognitionQueue = new Queue("image-recognition", {
      connection: connection(),
      defaultJobOptions: {
        ...defaultJobOptions,
      },
    });
  }
  return _imageRecognitionQueue;
}

// 文案生成队列
export function getListingGenerationQueue(): Queue {
  if (!_listingGenerationQueue) {
    _listingGenerationQueue = new Queue("listing-generation", {
      connection: connection(),
      defaultJobOptions: {
        ...defaultJobOptions,
      },
    });
  }
  return _listingGenerationQueue;
}

// 图片批量生成队列
export function getImageGenerationQueue(): Queue {
  if (!_imageGenerationQueue) {
    _imageGenerationQueue = new Queue("image-generation", {
      connection: connection(),
      defaultJobOptions: {
        ...defaultJobOptions,
        attempts: 2, // 图片生成只重试 2 次
      },
    });
  }
  return _imageGenerationQueue;
}

// 单张图片生成队列
export function getImageSingleGenerationQueue(): Queue {
  if (!_imageSingleGenerationQueue) {
    _imageSingleGenerationQueue = new Queue("image-single-generation", {
      connection: connection(),
      defaultJobOptions: {
        ...defaultJobOptions,
        attempts: 2,
      },
    });
  }
  return _imageSingleGenerationQueue;
}

// 兼容旧的导出方式(getter 模式)
export const imageRecognitionQueue = {
  get add() { return getImageRecognitionQueue().add.bind(getImageRecognitionQueue()); },
  get getJob() { return getImageRecognitionQueue().getJob.bind(getImageRecognitionQueue()); },
  get getJobs() { return getImageRecognitionQueue().getJobs.bind(getImageRecognitionQueue()); },
};

export const listingGenerationQueue = {
  get add() { return getListingGenerationQueue().add.bind(getListingGenerationQueue()); },
  get getJob() { return getListingGenerationQueue().getJob.bind(getListingGenerationQueue()); },
  get getJobs() { return getListingGenerationQueue().getJobs.bind(getListingGenerationQueue()); },
};

export const imageGenerationQueue = {
  get add() { return getImageGenerationQueue().add.bind(getImageGenerationQueue()); },
  get getJob() { return getImageGenerationQueue().getJob.bind(getImageGenerationQueue()); },
  get getJobs() { return getImageGenerationQueue().getJobs.bind(getImageGenerationQueue()); },
};

export const imageSingleGenerationQueue = {
  get add() { return getImageSingleGenerationQueue().add.bind(getImageSingleGenerationQueue()); },
  get getJob() { return getImageSingleGenerationQueue().getJob.bind(getImageSingleGenerationQueue()); },
  get getJobs() { return getImageSingleGenerationQueue().getJobs.bind(getImageSingleGenerationQueue()); },
};
