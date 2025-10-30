import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * 调试接口 - 测试工作流各个组件
 * GET /api/debug/workflow-test
 *
 * 注意: 生产环境请删除此文件!
 */
export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {},
  };

  // 测试 1: 数据库连接
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.tests.database = {
      status: "✅ 成功",
      message: "数据库连接正常",
    };
  } catch (error: any) {
    results.tests.database = {
      status: "❌ 失败",
      error: error.message,
    };
  }

  // 测试 2: Redis 连接
  try {
    const Redis = require("ioredis");
    const redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
    });
    await redis.ping();
    results.tests.redis = {
      status: "✅ 成功",
      message: "Redis 连接正常",
      url: process.env.REDIS_URL?.replace(/:[^:@]+@/, ':***@'), // 隐藏密码
    };
    redis.disconnect();
  } catch (error: any) {
    results.tests.redis = {
      status: "❌ 失败",
      error: error.message,
    };
  }

  // 测试 3: 创建测试工作流
  try {
    const workflow = await prisma.workflowExecution.create({
      data: {
        userId: "debug-test-user",
        imageUrl: "https://example.com/test.jpg",
        status: "PENDING",
        metadata: {
          test: true,
        },
      },
    });

    results.tests.createWorkflow = {
      status: "✅ 成功",
      workflowId: workflow.id,
      message: "工作流记录创建成功",
    };

    // 清理测试数据
    await prisma.workflowExecution.delete({
      where: { id: workflow.id },
    });
  } catch (error: any) {
    results.tests.createWorkflow = {
      status: "❌ 失败",
      error: error.message,
      stack: error.stack,
    };
  }

  // 测试 4: 队列连接
  try {
    const { imageRecognitionQueue } = require("@/lib/queues");

    // 检查队列是否可用
    const jobCounts = await imageRecognitionQueue.getJobCounts();

    results.tests.queue = {
      status: "✅ 成功",
      message: "队列连接正常",
      jobCounts,
    };
  } catch (error: any) {
    results.tests.queue = {
      status: "❌ 失败",
      error: error.message,
      stack: error.stack,
    };
  }

  // 测试 5: 添加队列任务
  try {
    const { imageRecognitionQueue } = require("@/lib/queues");

    const job = await imageRecognitionQueue.add("test-job", {
      workflowId: "test-workflow-id",
      imageUrl: "https://example.com/test.jpg",
    }, {
      removeOnComplete: true,
      removeOnFail: true,
    });

    results.tests.addJob = {
      status: "✅ 成功",
      jobId: job.id,
      message: "队列任务添加成功",
    };

    // 立即删除测试任务
    await job.remove();
  } catch (error: any) {
    results.tests.addJob = {
      status: "❌ 失败",
      error: error.message,
      stack: error.stack,
    };
  }

  // 总结
  const failedTests = Object.values(results.tests).filter(
    (test: any) => test.status.includes("❌")
  );

  results.summary = {
    total: Object.keys(results.tests).length,
    passed: Object.keys(results.tests).length - failedTests.length,
    failed: failedTests.length,
    allPassed: failedTests.length === 0,
  };

  const statusCode = failedTests.length > 0 ? 500 : 200;

  return NextResponse.json(results, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
